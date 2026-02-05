import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Template from "@/models/Template";
import Phone from "@/models/Phones";
import { templateUpdateSchema } from "@/libs/validators/template.validator";

// PUT /api/templates/[id] - Update a template
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
    const validatedData = templateUpdateSchema.parse(body);

    // Find template and check ownership
    const template = await Template.findOne({
      _id: id,
      user: session.user.id,
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found or access denied" },
        { status: 404 }
      );
    }

    // If messages are being updated, verify phone ownership
    if (validatedData.messages) {
      const phoneIds = [...new Set(
        validatedData.messages.map(m => m.phoneId)
      )];
      const phoneCount = await Phone.countDocuments({
        _id: { $in: phoneIds },
        user: session.user.id
      });

      console.log('[INFO] phoneIds', phoneIds);
      console.log('[INFO] phoneCount', phoneCount);

      if (phoneCount !== phoneIds.length) {
        return NextResponse.json(
          { error: "One or more invalid phone IDs" },
          { status: 400 }
        );
      }
    }

    // Update template
    Object.assign(template, validatedData);
    await template.save();

    // Populate before returning
    await template.populate("messages.phoneId", "phone status");

    return NextResponse.json(template);
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

// DELETE /api/templates/[id] - Delete a template
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
    // Find and delete template, checking ownership
    const template = await Template.findOneAndDelete({
      _id: id,
      user: session.user.id,
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
