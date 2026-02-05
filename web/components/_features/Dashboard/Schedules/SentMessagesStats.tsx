import React from "react";

interface Stats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  not_sent: number;
}

interface SentMessagesStatsProps {
  stats: Stats;
}

const SentMessagesStats: React.FC<SentMessagesStatsProps> = ({ stats }) => {
  const percentage = stats.total > 0
    ? Math.round((stats.sent / stats.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Total */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base-content/60 text-sm">Total</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
              <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Sent */}
      <div className="bg-success/10 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base-content/60 text-sm">Envoyés</p>
            <p className="text-3xl font-bold text-success">{stats.sent}</p>
            <p className="text-success text-xs mt-1">{percentage}%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-6 h-6 text-success"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Pending */}
      <div className="bg-warning/10 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base-content/60 text-sm">En cours</p>
            <p className="text-3xl font-bold text-warning">{stats.pending}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-6 h-6 text-warning"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Failed */}
      <div className="bg-error/10 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base-content/60 text-sm">Échoués</p>
            <p className="text-3xl font-bold text-error">{stats.failed}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-6 h-6 text-error"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Not sent yet */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base-content/60 text-sm">À venir</p>
            <p className="text-3xl font-bold text-base-content/60">
              {stats.not_sent}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-6 h-6 text-base-content/60"
            >
              <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentMessagesStats;
