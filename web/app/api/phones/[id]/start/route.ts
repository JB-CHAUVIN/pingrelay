/**
 * POST /api/phones/[id]/start
 *
 * Start a WhatsApp session after QR code has been scanned
 * Updates the phone status in the database to "connected"
 */

import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Phone from "@/models/Phones";
import { startSession, getSession } from "@/libs/waha";
import type { SessionStartResponse } from "@/types/waha.types";

export async function POST(
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

    // Start the WAHA session
    await startSession(phone.phone);
    console.log(`[API] Session started for ${phone.phone}`);

    // Verify the session is actually working
    const wahaSession = await getSession(phone.phone);

    // Update phone status in database
    phone.status = "connected";
    await phone.save();

    const response: SessionStartResponse = {
      message: "Session started successfully",
      status: wahaSession.status,
    };

    return NextResponse.json(response);
  } catch (e: any) {
    console.error("[API] Failed to start session:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to start session" },
      { status: 500 }
    );
  }
}
