import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Phone from "@/models/Phones";
import { phoneUpdateSchema } from "@/libs/validators/phone.validator";
import { deleteSession } from "@/libs/waha";

// PUT /api/phones/[id] - Update a phone
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectMongo();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Await params in Next.js 15
  const { id } = await params;

  try {
    const body = await req.json();
    const validatedData = phoneUpdateSchema.parse(body);

    // Find phone and check ownership
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

    // Update phone
    Object.assign(phone, validatedData);
    await phone.save();

    return NextResponse.json(phone);
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: e.errors },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// DELETE /api/phones/[id] - Delete a phone
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectMongo();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Await params in Next.js 15
  const { id } = await params;

  try {
    // First, find the phone to get the phone number (don't delete yet)
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

    // Delete WAHA session (best effort - don't fail the request if WAHA fails)
    try {
      await deleteSession(phone.phone);
      console.log(`[WAHA] Session deleted successfully for ${phone.phone}`);
    } catch (wahaError) {
      console.error(`[WAHA] Failed to delete session for ${phone.phone}:`, wahaError);
      // Continue - we'll delete from DB anyway to avoid orphan records
    }

    // Delete phone from database
    await Phone.findOneAndDelete({
      _id: id,
      user: session.user.id,
    });

    return NextResponse.json({ message: "Phone deleted successfully" });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
