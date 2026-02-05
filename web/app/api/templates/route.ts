import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Template from "@/models/Template";
import Phone from "@/models/Phones";
import { templateCreateSchema } from "@/libs/validators/template.validator";
import { syncTemplateMessages } from "@/libs/template-message-sync";

// GET /api/templates - List templates with pagination
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

    const [templates, totalItems] = await Promise.all([
      Template.find({ user: session.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("messages.phoneId", "phone status"),
      Template.countDocuments({ user: session.user.id }),
    ]);

    // Transform to JSON to apply toJSON plugin (_id -> id)
    const items = templates.map((template) => template.toJSON());

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

// POST /api/templates - Create a new template
export async function POST(req: NextRequest) {
  await connectMongo();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validate with Zod
    const validatedData = templateCreateSchema.parse(body);

    // Verify that all phoneIds belong to the user (security check)
    const phoneIds = [...new Set(
      validatedData.messages.map(m => m.phoneId)
    )];
    const phoneCount = await Phone.countDocuments({
      _id: { $in: phoneIds },
      user: session.user.id,
    });

    if (phoneCount !== phoneIds.length) {
      return NextResponse.json(
        { error: "One or more invalid phone IDs" },
        { status: 400 },
      );
    }

    // Create template
    const template = await Template.create({
      ...validatedData,
      user: session.user.id,
    });

    // Sync messages to Message collection (async, non-blocking)
    syncTemplateMessages(template._id, validatedData.messages).catch((err) =>
      console.error("[API] Failed to sync messages:", err)
    );

    // Populate before returning
    await template.populate("messages.phoneId", "phone status");

    return NextResponse.json(template, { status: 201 });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: e.errors },
        { status: 400 },
      );
    }
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
