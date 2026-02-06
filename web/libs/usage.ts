import config from "@/config";
import Schedule from "@/models/Schedule";
import SentMessage from "@/models/SentMessage";

/**
 * Get the number of successfully sent messages this month for a user
 */
export async function getMonthlyMessageCount(
  userId: string
): Promise<number> {
  // Get all schedule IDs for this user
  const schedules = await Schedule.find({ user: userId }).select("_id").lean();
  const scheduleIds = schedules.map((s: any) => s._id);

  if (scheduleIds.length === 0) return 0;

  // Start of current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Count sent messages this month
  const count = await SentMessage.countDocuments({
    scheduleId: { $in: scheduleIds },
    status: "sent",
    successDate: { $gte: startOfMonth },
  });

  return count;
}

/**
 * Find the plan config matching a priceId
 */
export function getUserPlan(priceId: string | null) {
  if (!priceId) return null;
  return config.stripe.plans.find((p) => p.priceId === priceId) || null;
}

/**
 * Get plan limits from a priceId.
 * Returns { messagesPerMonth: 0, templates: 0 } if no active plan.
 */
export function getPlanLimits(
  priceId: string | null
): { messagesPerMonth: number; templates: number } {
  const plan = getUserPlan(priceId);
  if (!plan?.limits) {
    return { messagesPerMonth: 0, templates: 0 };
  }
  return plan.limits;
}
