/**
 * GET /api/phones/[id]/qr
 *
 * Downloads and returns the QR code image for a phone number to pair with WhatsApp
 * This endpoint proxies the QR code from WAHA to avoid htaccess protection issues
 */

import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Phone from "@/models/Phones";
import { downloadQRCode, getSession, startSession, createSession } from "@/libs/waha";

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
  console.log("[API QR] Request for phone ID:", id);

  try {
    // Find phone and verify ownership
    const phone = await Phone.findOne({
      _id: id,
      user: session.user.id,
    });

    if (!phone) {
      console.error("[API QR] Phone not found or access denied");
      return NextResponse.json(
        { error: "Phone not found or access denied" },
        { status: 404 }
      );
    }

    // Check session status first
    console.log("[API QR] Checking session status for phone:", phone.phone);
    let wahaSession;
    let sessionJustCreated = false;

    try {
      wahaSession = await getSession(phone.phone);
      console.log("[API QR] Existing session found, status:", wahaSession.status);
    } catch (error: any) {
      // Session doesn't exist, create it
      console.log("[API QR] Session not found, creating it...");
      wahaSession = await createSession(phone.phone);
      sessionJustCreated = true;
      console.log("[API QR] Session created with status:", wahaSession.status);
    }

    // If already connected, return error
    if (wahaSession.status === "WORKING") {
      console.log("[API QR] Session is already connected (WORKING)");
      return NextResponse.json(
        {
          error: "Ce numéro est déjà connecté à WhatsApp.",
          status: wahaSession.status
        },
        { status: 400 }
      );
    }

    // Start the session if it's STOPPED or just created
    const needsStart = wahaSession.status === "STOPPED" ||
                       (sessionJustCreated && wahaSession.status !== "SCAN_QR_CODE" && wahaSession.status !== "STARTING");

    console.log("[API QR] Session status:", wahaSession.status, "| Needs start:", needsStart);

    if (needsStart) {
      console.log("[API QR] Starting session...");
      try {
        wahaSession = await startSession(phone.phone);
        console.log("[API QR] Session started successfully, new status:", wahaSession.status);
      } catch (startError: any) {
        console.error("[API QR] Failed to start session:", startError.message);
        // Continue anyway, maybe it's already starting
      }
    }

    // Wait for session to reach SCAN_QR_CODE state (max 15 seconds)
    let attempts = 0;
    while (wahaSession.status !== "SCAN_QR_CODE" && attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      wahaSession = await getSession(phone.phone);
      console.log(`[API QR] Session status after ${attempts + 1}s:`, wahaSession.status);

      if (wahaSession.status === "SCAN_QR_CODE") {
        break;
      }

      // If session failed, try to restart it
      if (wahaSession.status === "FAILED") {
        console.log("[API QR] Session FAILED, restarting...");
        wahaSession = await startSession(phone.phone);
      }

      attempts++;
    }

    // Only download QR if session is in SCAN_QR_CODE state
    if (wahaSession.status !== "SCAN_QR_CODE") {
      console.error("[API QR] Session is not ready for QR code. Status:", wahaSession.status);
      return NextResponse.json(
        {
          error: `Session is in ${wahaSession.status} state. Please wait and try again.`,
          status: wahaSession.status
        },
        { status: 422 }
      );
    }

    console.log("[API QR] Downloading QR code for phone:", phone.phone);
    // Download QR code image from WAHA
    const imageBuffer = await downloadQRCode(phone.phone);
    console.log("[API QR] QR code downloaded, size:", imageBuffer.length, "bytes");

    // Return the image directly with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (e: any) {
    console.error("[API] Failed to get QR code:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to get QR code" },
      { status: 500 }
    );
  }
}
