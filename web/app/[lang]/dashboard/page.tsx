import { auth } from "@/libs/next-auth";
import { redirect, notFound } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import Phones from "@/models/Phones";
import Template from "@/models/Template";
import Schedule from "@/models/Schedule";
import SentMessage from "@/models/SentMessage";
import User from "@/models/User";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { i18n, type Locale } from "@/i18n/config";
import { getMonthlyMessageCount, getUserPlan, getPlanLimits } from "@/libs/usage";

export const dynamic = "force-dynamic";

async function getDashboardData(userId: string) {
  await connectMongo();

  const [phoneCount, templateCount, scheduleCount] = await Promise.all([
    Phones.countDocuments({ user: userId }),
    Template.countDocuments({ user: userId }),
    Schedule.countDocuments({ user: userId }),
  ]);

  const activeSchedules = await Schedule.find({
    user: userId,
    status: { $in: ["pending", "running"] },
  })
    .populate("messageTemplateId")
    .sort({ eventDate: 1 })
    .limit(5)
    .lean();

  const schedulesWithProgress = await Promise.all(
    activeSchedules.map(async (schedule: any) => {
      const template = schedule.messageTemplateId;
      const totalMessages = template?.messages?.length || 0;

      const sentCount = await SentMessage.countDocuments({
        scheduleId: schedule._id,
        status: "sent",
      });

      const failedCount = await SentMessage.countDocuments({
        scheduleId: schedule._id,
        status: "failed",
      });

      const pendingCount = totalMessages - sentCount - failedCount;

      return {
        id: schedule._id.toString(),
        groupName: schedule.groupName,
        eventDate: schedule.eventDate,
        status: schedule.status,
        templateTitle: template?.titre || "Template supprimé",
        progress: {
          total: totalMessages,
          sent: sentCount,
          failed: failedCount,
          pending: pendingCount,
          percentage:
            totalMessages > 0 ? Math.round((sentCount / totalMessages) * 100) : 0,
        },
      };
    })
  );

  // Fetch user subscription info
  const user = await User.findById(userId).lean() as any;
  const plan = getUserPlan(user?.priceId || null);
  const limits = getPlanLimits(user?.priceId || null);
  const messagesThisMonth = await getMonthlyMessageCount(userId);

  return {
    stats: {
      phones: phoneCount,
      templates: templateCount,
      schedules: scheduleCount,
    },
    activeSchedules: schedulesWithProgress,
    subscription: {
      hasAccess: user?.hasAccess || false,
      planName: plan?.name || null,
      messagesThisMonth,
      messagesLimit: limits.messagesPerMonth,
      templates: templateCount,
      templatesLimit: limits.templates,
    },
  };
}

export default async function Dashboard({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  // Validate locale
  if (!i18n.locales.includes(lang as Locale)) {
    notFound();
  }

  const dict = await getDictionary(lang);

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const data = await getDashboardData(session.user.id);

  const isNewUser =
    data.stats.phones === 0 &&
    data.stats.templates === 0 &&
    data.stats.schedules === 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent p-10">
            {dict.dashboard.welcome}
          </h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            {dict.dashboard.description}
          </p>
        </div>

        {/* Subscription Banner */}
        {!data.subscription.hasAccess ? (
          <div className="alert alert-warning shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <p className="font-semibold">
                {dict.dashboard.subscriptionBanner.noSubscription}
              </p>
            </div>
            <Link
              href={`/${lang}/dashboard/billing`}
              className="btn btn-primary btn-sm"
            >
              {dict.dashboard.subscriptionBanner.subscribe}
            </Link>
          </div>
        ) : (
          <div className="bg-base-100 rounded-xl shadow-lg p-4 border border-base-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="badge badge-primary badge-lg">
                  {data.subscription.planName}
                </div>
                {data.subscription.messagesLimit === -1 ? (
                  <span className="text-sm text-base-content/70">
                    {dict.dashboard.subscriptionBanner.messagesUnlimited
                      .replace("{count}", String(data.subscription.messagesThisMonth))}
                  </span>
                ) : (
                  <span className="text-sm text-base-content/70">
                    {dict.dashboard.subscriptionBanner.messagesUsage
                      .replace("{count}", String(data.subscription.messagesThisMonth))
                      .replace("{limit}", String(data.subscription.messagesLimit))}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 min-w-[200px]">
                {data.subscription.messagesLimit === -1 ? (
                  <progress
                    className="progress progress-success w-full"
                    value={100}
                    max="100"
                  ></progress>
                ) : (
                  <>
                    <progress
                      className={`progress w-full ${
                        data.subscription.messagesThisMonth / data.subscription.messagesLimit > 0.8
                          ? "progress-warning"
                          : "progress-primary"
                      }`}
                      value={data.subscription.messagesThisMonth}
                      max={data.subscription.messagesLimit}
                    ></progress>
                    {data.subscription.messagesThisMonth / data.subscription.messagesLimit > 0.8 && (
                      <span className="text-xs text-warning font-semibold whitespace-nowrap">
                        {dict.dashboard.subscriptionBanner.warningLimit}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="stat bg-base-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-primary overflow-hidden">
            <div className="stat-figure text-primary hidden xl:block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div className="stat-title">{dict.dashboard.phones}</div>
            <div className="stat-value text-primary">{data.stats.phones}</div>
            <div className="stat-desc">
              <Link href={`/${lang}/dashboard/phones`} className="link link-primary">
                {dict.dashboard.managePhones}
              </Link>
            </div>
          </div>

          <div className="stat bg-base-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-accent overflow-hidden">
            <div className="stat-figure text-accent hidden xl:block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="stat-title">{dict.dashboard.templates}</div>
            <div className="stat-value text-accent">{data.stats.templates}</div>
            <div className="stat-desc">
              <Link href={`/${lang}/dashboard/templates`} className="link link-accent">
                {dict.dashboard.manageTemplates}
              </Link>
            </div>
          </div>

          <div className="stat bg-base-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-secondary overflow-hidden">
            <div className="stat-figure text-secondary hidden xl:block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="stat-title">{dict.dashboard.schedules}</div>
            <div className="stat-value text-secondary">{data.stats.schedules}</div>
            <div className="stat-desc">
              <Link href={`/${lang}/dashboard/schedules`} className="link link-secondary">
                {dict.dashboard.manageSchedules}
              </Link>
            </div>
          </div>
        </div>

        {/* Getting Started Section (only for new users) */}
        {isNewUser && (
          <div className="bg-base-100 rounded-2xl shadow-xl p-6 md:p-8 border border-base-300">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {dict.dashboard.getStarted}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="card-body items-center text-center">
                  <div className="bg-primary text-primary-content w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    1
                  </div>
                  <h3 className="card-title text-lg">{dict.dashboard.step1.title}</h3>
                  <p className="text-sm text-base-content/70">
                    {dict.dashboard.step1.description}
                  </p>
                  <div className="card-actions mt-4">
                    <Link
                      href={`/${lang}/dashboard/phones`}
                      className="btn btn-primary btn-sm"
                    >
                      {dict.dashboard.step1.cta}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="card bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30 hover:border-accent/50 transition-all hover:shadow-lg">
                <div className="card-body items-center text-center">
                  <div className="bg-accent text-accent-content w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    2
                  </div>
                  <h3 className="card-title text-lg">{dict.dashboard.step2.title}</h3>
                  <p className="text-sm text-base-content/70">
                    {dict.dashboard.step2.description}
                  </p>
                  <div className="card-actions mt-4">
                    <Link
                      href={`/${lang}/dashboard/templates`}
                      className="btn btn-accent btn-sm"
                    >
                      {dict.dashboard.step2.cta}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/30 hover:border-secondary/50 transition-all hover:shadow-lg">
                <div className="card-body items-center text-center">
                  <div className="bg-secondary text-secondary-content w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    3
                  </div>
                  <h3 className="card-title text-lg">{dict.dashboard.step3.title}</h3>
                  <p className="text-sm text-base-content/70">
                    {dict.dashboard.step3.description}
                  </p>
                  <div className="card-actions mt-4">
                    <Link
                      href={`/${lang}/dashboard/schedules`}
                      className="btn btn-secondary btn-sm"
                    >
                      {dict.dashboard.step3.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-info mt-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div>
                <h3 className="font-bold">{dict.dashboard.autoSending.title}</h3>
                <div className="text-xs">
                  {dict.dashboard.autoSending.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Schedules */}
        {data.activeSchedules.length > 0 && (
          <div className="bg-base-100 rounded-2xl shadow-xl p-6 md:p-8 border border-base-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                <h2 className="text-2xl font-bold">{dict.dashboard.activeWebinars}</h2>
              </div>
              <Link
                href={`/${lang}/dashboard/schedules`}
                className="btn btn-ghost btn-sm"
              >
                {dict.dashboard.viewAll}
              </Link>
            </div>

            <div className="space-y-4">
              {data.activeSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="card bg-gradient-to-br from-base-100 to-base-200 border border-base-300 hover:border-primary/30 transition-all hover:shadow-lg"
                >
                  <div className="card-body">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {schedule.groupName}
                        </h3>
                        <p className="text-sm text-base-content/70">
                          Template: {schedule.templateTitle}
                        </p>
                        <p className="text-xs text-base-content/60 mt-1">
                          Événement:{" "}
                          {new Date(schedule.eventDate).toLocaleDateString(
                            lang,
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[250px]">
                        <div className="flex justify-between text-sm">
                          <span>{dict.dashboard.progress}</span>
                          <span className="font-semibold">
                            {schedule.progress.sent} / {schedule.progress.total}
                          </span>
                        </div>
                        <progress
                          className="progress progress-success w-full"
                          value={schedule.progress.percentage}
                          max="100"
                        ></progress>
                        <div className="flex justify-between text-xs text-base-content/60">
                          <span>
                            {schedule.progress.pending > 0 &&
                              `${schedule.progress.pending} ${dict.dashboard.pending}`}
                          </span>
                          <span>
                            {schedule.progress.failed > 0 &&
                              `${schedule.progress.failed} ${dict.dashboard.failed}`}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Link
                          href={`/${lang}/dashboard/schedules/${schedule.id}`}
                          className="btn btn-sm btn-outline"
                        >
                          {dict.dashboard.details}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for experienced users */}
        {!isNewUser && data.activeSchedules.length === 0 && (
          <div className="bg-base-100 rounded-lg shadow-lg p-6 md:p-8 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 mx-auto text-base-content/30"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              <h3 className="text-xl font-semibold">
                {dict.dashboard.noActiveWebinars}
              </h3>
              <p className="text-base-content/70">
                {dict.dashboard.noActiveWebinarsDesc}
              </p>
              <Link
                href={`/${lang}/dashboard/schedules`}
                className="btn btn-primary"
              >
                {dict.dashboard.createSchedule}
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
