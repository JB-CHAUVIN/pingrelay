import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Phone from "@/models/Phones";
import User from "@/models/User";
import { phoneCreateSchema } from "@/libs/validators/phone.validator";
import { createSession } from "@/libs/waha";

// GET /api/phones - List phones with pagination
export async function GET(req: NextRequest) {
  await connectMongo();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Query only user's phones
    const [phones, totalItems] = await Promise.all([
      Phone.find({ user: session.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Phone.countDocuments({ user: session.user.id }),
    ]);

    // Transform to JSON to apply toJSON plugin (_id -> id)
    const items = phones.map(phone => phone.toJSON());

    return NextResponse.json({
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// POST /api/phones - Create a new phone
export async function POST(req: NextRequest) {
  await connectMongo();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check subscription access
    const user = await User.findById(session.user.id).lean() as any;
    if (!user?.hasAccess) {
      return NextResponse.json(
        { error: "Subscription required" },
        { status: 403 },
      );
    }

    const body = await req.json();

    // Validate with Zod
    const validatedData = phoneCreateSchema.parse(body);

    // Check if phone already exists for this user
    const existingPhone = await Phone.findOne({
      phone: validatedData.phone,
      user: session.user.id,
    });

    if (existingPhone) {
      return NextResponse.json(
        { error: "Phone number already exists" },
        { status: 400 }
      );
    }

    // Create phone in DB with "disconnected" status
    const phone = await Phone.create({
      ...validatedData,
      user: session.user.id,
      status: "disconnected",
    });

    // Create WAHA session (best effort - don't fail the request if WAHA fails)
    try {
      await createSession(validatedData.phone);
      console.log(`[WAHA] Session created successfully for ${validatedData.phone}`);
    } catch (wahaError) {
      console.error(`[WAHA] Failed to create session for ${validatedData.phone}:`, wahaError);
      // Continue - user can retry connection later via QR modal
    }

    return NextResponse.json(phone, { status: 201 });
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
