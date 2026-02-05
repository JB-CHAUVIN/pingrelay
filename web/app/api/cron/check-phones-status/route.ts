/**
 * POST /api/cron/check-phones-status
 *
 * Cron job that runs every 10 minutes to sync phone statuses between WAHA and MongoDB
 * Vercel Cron will call this endpoint automatically
 *
 * Security: Uses Bearer token authentication (CRON_SECRET)
 */

import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/libs/mongoose";
import Phone from "@/models/Phones";
import { getSession, isSessionConnected } from "@/libs/waha";
import type { CronStatusCheckResponse } from "@/types/waha.types";

/**
 * Validate cron request authorization
 * In production: requires Bearer token matching CRON_SECRET
 * In development: allows all requests
 */
function isValidCronRequest(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");

  // In production, verify the CRON_SECRET
  if (process.env.NODE_ENV === "production") {
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    return authHeader === expectedAuth;
  }

  // In development, allow all requests for easier testing
  return true;
}

export async function POST(req: NextRequest) {
  // Verify cron authorization
  if (!isValidCronRequest(req)) {
    console.error("[CRON] Unauthorized cron request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectMongo();

  console.log("[CRON] Starting phone status check...");

  let checked = 0;
  let updated = 0;
  let errors = 0;

  try {
    // Get all phones from database
    const phones = await Phone.find({}).lean();

    console.log(`[CRON] Found ${phones.length} phones to check`);

    // Check each phone's status on WAHA
    for (const phone of phones) {
      checked++;

      try {
        // Get session status from WAHA
        const wahaSession = await getSession(phone.phone);
        const isConnected = isSessionConnected(wahaSession);

        // Determine what the status should be
        const expectedStatus = isConnected ? "connected" : "disconnected";

        // If status differs from DB, update it
        if (phone.status !== expectedStatus) {
          await Phone.updateOne(
            { _id: phone._id },
            { status: expectedStatus }
          );

          console.log(
            `[CRON] Updated ${phone.phone}: ${phone.status} → ${expectedStatus}`
          );
          updated++;
        }
      } catch (phoneError) {
        console.error(
          `[CRON] Error checking ${phone.phone}:`,
          phoneError
        );
        errors++;
        // Continue to next phone
      }
    }

    const response: CronStatusCheckResponse = {
      message: "Phone status check completed",
      checked,
      updated,
      errors,
    };

    console.log(
      `[CRON] Completed: ${checked} checked, ${updated} updated, ${errors} errors`
    );

    return NextResponse.json(response);
  } catch (e: any) {
    console.error("[CRON] Fatal error during status check:", e);
    return NextResponse.json(
      {
        error: e?.message || "Failed to check phone statuses",
        checked,
        updated,
        errors,
      },
      { status: 500 }
    );
  }
}
