import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Schedule from "@/models/Schedule";
import Template from "@/models/Template";
import { scheduleCreateSchema } from "@/libs/validators/schedule.validator";

// GET /api/schedules - List schedules with pagination
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

    const [schedules, totalItems] = await Promise.all([
      Schedule.find({ user: session.user.id })
        .sort({ eventDate: 1 })
        .skip(skip)
        .limit(limit)
        .populate("messageTemplateId", "titre"),
      Schedule.countDocuments({ user: session.user.id }),
    ]);

    // Transform to JSON to apply toJSON plugin (_id -> id)
    const items = schedules.map(schedule => schedule.toJSON());

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

// POST /api/schedules - Create a new schedule
export async function POST(req: NextRequest) {
  await connectMongo();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validate with Zod
    const validatedData = scheduleCreateSchema.parse(body);

    // Verify template exists and belongs to user
    const template = await Template.findOne({
      _id: validatedData.messageTemplateId,
      user: session.user.id,
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found or access denied" },
        { status: 404 }
      );
    }

    // Create schedule
    const schedule = await Schedule.create({
      ...validatedData,
      user: session.user.id,
    });

    // Populate before returning
    await schedule.populate("messageTemplateId", "titre");

    return NextResponse.json(schedule, { status: 201 });
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
