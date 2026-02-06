import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Template from "@/models/Template";
import { getMonthlyMessageCount, getUserPlan, getPlanLimits } from "@/libs/usage";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();

    const user = await User.findById(session.user.id).lean() as any;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = getUserPlan(user.priceId || null);
    const limits = getPlanLimits(user.priceId || null);

    const [messagesThisMonth, templatesCount] = await Promise.all([
      getMonthlyMessageCount(session.user.id),
      Template.countDocuments({ user: session.user.id }),
    ]);

    return NextResponse.json({
      plan: plan
        ? { name: plan.name, priceId: plan.priceId, limits: plan.limits }
        : null,
      usage: {
        messagesThisMonth,
        messagesLimit: limits.messagesPerMonth,
        templates: templatesCount,
        templatesLimit: limits.templates,
      },
      hasAccess: user.hasAccess || false,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
