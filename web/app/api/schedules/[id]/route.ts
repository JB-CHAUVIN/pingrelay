import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Schedule from "@/models/Schedule";
import { scheduleUpdateSchema } from "@/libs/validators/schedule.validator";

// PUT /api/schedules/[id] - Update a schedule
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectMongo();
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = scheduleUpdateSchema.parse(body);

    // Find schedule and check ownership
    const schedule = await Schedule.findOne({
      _id: id,
      user: session.user.id,
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found or access denied" },
        { status: 404 }
      );
    }

    // Update schedule
    Object.assign(schedule, validatedData);
    await schedule.save();

    // Populate before returning
    await schedule.populate("messageTemplateId", "titre");

    return NextResponse.json(schedule);
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

// DELETE /api/schedules/[id] - Delete a schedule
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectMongo();
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find and delete schedule, checking ownership
    const schedule = await Schedule.findOneAndDelete({
      _id: id,
      user: session.user.id,
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
