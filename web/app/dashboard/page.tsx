import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import Phones from "@/models/Phones";
import Template from "@/models/Template";
import Schedule from "@/models/Schedule";
import SentMessage from "@/models/SentMessage";
import Link from "next/link";
import { ISchedule } from "@/types/schedule.types";

export const dynamic = "force-dynamic";

async function getDashboardData(userId: string) {
  await connectMongo();

  // Get counts
  const [phoneCount, templateCount, scheduleCount] = await Promise.all([
    Phones.countDocuments({ user: userId }),
    Template.countDocuments({ user: userId }),
    Schedule.countDocuments({ user: userId }),
  ]);

  // Get active schedules (pending or running)
  const activeSchedules = await Schedule.find({
    user: userId,
    status: { $in: ["pending", "running"] },
  })
    .populate("messageTemplateId")
    .sort({ eventDate: 1 })
    .limit(5)
    .lean();

  // Get sent messages stats for active schedules
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

  return {
    stats: {
      phones: phoneCount,
      templates: templateCount,
      schedules: scheduleCount,
    },
    activeSchedules: schedulesWithProgress,
  };
}

export default async function Dashboard() {
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
    <main className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Bienvenue sur PingRelay
          </h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Automatisez vos messages WhatsApp pour vos webinars et événements.
            Configurez une fois, envoyez automatiquement.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-primary">
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
            <div className="stat-title">Téléphones WhatsApp</div>
            <div className="stat-value text-primary">{data.stats.phones}</div>
            <div className="stat-desc">
              <Link href="/dashboard/phones" className="link link-primary">
                Gérer les téléphones
              </Link>
            </div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-secondary">
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
            <div className="stat-title">Templates</div>
            <div className="stat-value text-secondary">{data.stats.templates}</div>
            <div className="stat-desc">
              <Link href="/dashboard/templates" className="link link-secondary">
                Gérer les templates
              </Link>
            </div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-accent">
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
            <div className="stat-title">Programmations</div>
            <div className="stat-value text-accent">{data.stats.schedules}</div>
            <div className="stat-desc">
              <Link href="/dashboard/schedules" className="link link-accent">
                Gérer les programmations
              </Link>
            </div>
          </div>
        </div>

        {/* Getting Started Section (only for new users) */}
        {isNewUser && (
          <div className="bg-base-100 rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Commencez en 3 étapes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="card bg-primary/10 border-2 border-primary/20">
                <div className="card-body items-center text-center">
                  <div className="bg-primary text-primary-content w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    1
                  </div>
                  <h3 className="card-title text-lg">Ajouter un téléphone</h3>
                  <p className="text-sm text-base-content/70">
                    Connectez un ou plusieurs numéros WhatsApp qui enverront vos
                    messages automatiquement.
                  </p>
                  <div className="card-actions mt-4">
                    <Link
                      href="/dashboard/phones"
                      className="btn btn-primary btn-sm"
                    >
                      Ajouter un téléphone
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="card bg-secondary/10 border-2 border-secondary/20">
                <div className="card-body items-center text-center">
                  <div className="bg-secondary text-secondary-content w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    2
                  </div>
                  <h3 className="card-title text-lg">Créer un template</h3>
                  <p className="text-sm text-base-content/70">
                    Configurez vos messages avec leurs horaires d'envoi (avant,
                    pendant, après l'événement).
                  </p>
                  <div className="card-actions mt-4">
                    <Link
                      href="/dashboard/templates"
                      className="btn btn-secondary btn-sm"
                    >
                      Créer un template
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="card bg-accent/10 border-2 border-accent/20">
                <div className="card-body items-center text-center">
                  <div className="bg-accent text-accent-content w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    3
                  </div>
                  <h3 className="card-title text-lg">Programmer l'envoi</h3>
                  <p className="text-sm text-base-content/70">
                    Associez un template à un groupe WhatsApp et une date
                    d'événement. C'est tout !
                  </p>
                  <div className="card-actions mt-4">
                    <Link
                      href="/dashboard/schedules"
                      className="btn btn-accent btn-sm"
                    >
                      Créer une programmation
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
                <h3 className="font-bold">Envoi automatique</h3>
                <div className="text-xs">
                  Toutes les minutes, notre système vérifie les messages à envoyer
                  et les envoie automatiquement sur WhatsApp pour vous.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Schedules */}
        {data.activeSchedules.length > 0 && (
          <div className="bg-base-100 rounded-lg shadow-lg p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Webinars en cours</h2>
              <Link
                href="/dashboard/schedules"
                className="btn btn-ghost btn-sm"
              >
                Voir tout
              </Link>
            </div>

            <div className="space-y-4">
              {data.activeSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="card bg-base-200 border border-base-300"
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
                            "fr-FR",
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
                          <span>Progression</span>
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
                              `${schedule.progress.pending} en attente`}
                          </span>
                          <span>
                            {schedule.progress.failed > 0 &&
                              `${schedule.progress.failed} échec(s)`}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Link
                          href={`/dashboard/schedules/${schedule.id}`}
                          className="btn btn-sm btn-outline"
                        >
                          Détails
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
                Aucun webinar en cours
              </h3>
              <p className="text-base-content/70">
                Créez une nouvelle programmation pour démarrer l'envoi automatique
                de vos messages WhatsApp.
              </p>
              <Link
                href="/dashboard/schedules"
                className="btn btn-primary"
              >
                Créer une programmation
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
