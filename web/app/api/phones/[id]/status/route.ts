/**
 * GET /api/phones/[id]/status
 *
 * Check the status of a WhatsApp session on WAHA
 * Used for polling to detect when QR code has been scanned
 */

import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Phone from "@/models/Phones";
import { getSession, isSessionConnected, normalizePhoneNumber, startSession } from "@/libs/waha";
import type { PhoneStatusResponse } from "@/types/waha.types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectMongo();

  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Await params in Next.js 15
  const { id } = await params;

  try {
    // Find phone and verify ownership
    const phone = await Phone.findOne({
      _id: id,
      user: session.user.id,
    });

    if (!phone) {
      return NextResponse.json(
        { error: "Phone not found or access denied" },
        { status: 404 }
      );
    }

    // Get session status from WAHA
    const wahaSessionId = normalizePhoneNumber(phone?.phone);
    console.log("[INFO] Normalized session", wahaSessionId);
    const wahaSession = await getSession(wahaSessionId);
    const connected = isSessionConnected(wahaSession);

    // If WAHA says connected but DB says disconnected, start the session and update DB
    if (connected && phone.status === "disconnected") {
      try {
        await startSession(wahaSessionId);
        console.log(`[API] Session started for ${wahaSessionId}`);

        // Update phone status in database
        phone.status = "connected";
        await phone.save();
      } catch (startError) {
        console.error(`[API] Failed to start session for ${phone.phone}:`, startError);
        // Continue - return status anyway
      }
    }

    const response: PhoneStatusResponse = {
      status: wahaSession.status,
      connected,
      me: wahaSession.me,
    };

    return NextResponse.json(response);
  } catch (e: any) {
    console.error("[API] Failed to get session status:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to get session status" },
      { status: 500 }
    );
  }
}
