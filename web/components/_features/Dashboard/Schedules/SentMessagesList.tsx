import React, { useState } from "react";
import { getErrorMessage, formatError } from "@/libs/error-messages";

interface SentMessageLog {
  timestamp: string;
  errorCode?: string;
  errorData?: Record<string, any>;
  message?: string;
}

interface SentMessage {
  messageIndex: number;
  sendTimeType?: "fixed_time" | "event_time" | "relative_time";
  sendOnDay: string;
  sendOnHour: string;
  messageTemplate: string;
  image?: string;
  video?: string;
  phone: string | null;
  status: "sent" | "failed" | "pending" | "not_sent";
  // Tracking dates
  lastTryDate?: string | null;
  successDate?: string | null;
  lastErrorDate?: string | null;
  sentAt: string | null; // Legacy
  wahaResponse: any;
  // Structured errors
  errorCode?: string | null;
  errorData?: Record<string, any> | null;
  error: string | null; // Legacy
  logs?: SentMessageLog[];
  groupId: string | null;
  _id: string | null;
  templateModified?: boolean;
}

interface SentMessagesListProps {
  messages: SentMessage[];
  eventDate: string;
}

const SentMessagesList: React.FC<SentMessagesListProps> = ({
  messages,
  eventDate,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  const getStatusBadge = (status: string) => {
    const configs = {
      sent: { label: "Envoyé", className: "badge-success" },
      failed: { label: "Échoué", className: "badge-error" },
      pending: { label: "En cours", className: "badge-warning" },
      not_sent: { label: "À venir", className: "badge-ghost" },
    };

    const config = configs[status as keyof typeof configs] || configs.not_sent;

    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  const calculateExecutionDate = (message: SentMessage) => {
    const eventDateObj = new Date(eventDate);
    const type = message.sendTimeType || "fixed_time";

    if (type === "event_time") {
      // Send exactly at the event date/time
      return new Date(eventDateObj);
    }

    if (type === "relative_time") {
      // Add/subtract days and signed hours/minutes from event time
      const days = parseInt(message.sendOnDay) || 0;
      const hourStr = message.sendOnHour;
      const negative = hourStr.startsWith("-");
      const clean = negative ? hourStr.slice(1) : hourStr;
      const [h, m] = clean.split(":").map(Number);
      const parsedHours = negative ? -(h || 0) : (h || 0);
      const parsedMinutes = negative ? -(m || 0) : (m || 0);

      const executionDate = new Date(eventDateObj);
      executionDate.setDate(executionDate.getDate() + days);
      executionDate.setHours(executionDate.getHours() + parsedHours);
      executionDate.setMinutes(executionDate.getMinutes() + parsedMinutes);
      executionDate.setSeconds(0, 0);
      return executionDate;
    }

    // fixed_time: Add days and set specific clock time
    const days = parseInt(message.sendOnDay) || 0;
    const [hours, minutes] = message.sendOnHour.split(":").map(Number);
    const executionDate = new Date(eventDateObj);
    executionDate.setDate(executionDate.getDate() + days);
    executionDate.setHours(hours, minutes, 0, 0);
    return executionDate;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isDue = (message: SentMessage) => {
    const executionDate = calculateExecutionDate(message);
    return new Date() >= executionDate;
  };

  return (
    <div className="space-y-4">
      {/* Debug mode toggle */}
      <div className="flex justify-end">
        <div className="form-control">
          <label className="label cursor-pointer gap-2">
            <span className="label-text">Mode debug</span>
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
            />
          </label>
        </div>
      </div>

      {/* Messages list */}
      <div className="space-y-3">
        {messages.map((message) => {
          const executionDate = calculateExecutionDate(message);
          const isExpanded = expandedIndex === message.messageIndex;
          const shouldBeSent = isDue(message);

          return (
            <div
              key={message.messageIndex}
              className="border border-base-300 rounded-lg p-4 hover:bg-base-200 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-lg">
                      Message {message.messageIndex + 1}
                    </span>
                    {getStatusBadge(message.status)}
                    {message.status === "not_sent" && shouldBeSent && (
                      <span className="badge badge-warning badge-sm">
                        En retard
                      </span>
                    )}
                    {message.templateModified && (
                      <span
                        className="badge badge-info badge-sm"
                        title="Le template a été modifié après l'envoi de ce message"
                      >
                        Template modifié
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-base-content/60 space-y-1">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        Programmé pour : {formatDate(executionDate)} (J
                        {message.sendOnDay})
                      </span>
                    </div>

                    {message.successDate && (
                      <div className="flex items-center gap-2 text-success">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          Envoyé le :{" "}
                          {new Date(message.successDate).toLocaleString("fr-FR")}
                        </span>
                      </div>
                    )}

                    {message.lastTryDate && (
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          Dernière tentative :{" "}
                          {new Date(message.lastTryDate).toLocaleString("fr-FR")}
                        </span>
                      </div>
                    )}

                    {message.lastErrorDate && (
                      <div className="flex items-center gap-2 text-error">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          Dernière erreur :{" "}
                          {new Date(message.lastErrorDate).toLocaleString("fr-FR")}
                        </span>
                      </div>
                    )}

                    {message.phone && (
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Téléphone : {message.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Attachments */}
                  {(message.image || message.video) && (
                    <div className="flex gap-2 mt-2">
                      {message.image && (
                        <span className="badge badge-sm badge-outline">
                          📷 Image
                        </span>
                      )}
                      {message.video && (
                        <span className="badge badge-sm badge-outline">
                          🎥 Vidéo
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Expand button */}
                <button
                  className="btn btn-sm btn-ghost btn-circle"
                  onClick={() =>
                    setExpandedIndex(isExpanded ? null : message.messageIndex)
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-5 h-5 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-base-300 space-y-4">
                  {/* Message content */}
                  <div>
                    <h4 className="font-semibold mb-2">Contenu du message :</h4>
                    <div className="bg-base-300 rounded-lg p-3">
                      <p className="whitespace-pre-wrap text-sm">
                        {message.messageTemplate}
                      </p>
                    </div>
                  </div>

                  {/* Error message */}
                  {(message.errorCode || message.error) && (
                    <div className="alert alert-error">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current shrink-0 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-bold">
                          {message.errorCode
                            ? getErrorMessage(message.errorCode)
                            : "Erreur d'envoi"}
                        </h4>
                        {message.errorData && (
                          <p className="text-sm">
                            {formatError(message.errorCode, message.errorData)}
                          </p>
                        )}
                        {!message.errorData && message.error && (
                          <p className="text-sm">{message.error}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Logs history */}
                  {message.logs && message.logs.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Historique ({message.logs.length} événement
                        {message.logs.length > 1 ? "s" : ""})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {[...message.logs].reverse().map((log, index) => (
                          <div
                            key={index}
                            className={`border-l-4 pl-3 py-2 text-sm ${
                              log.errorCode
                                ? "border-error bg-error/10"
                                : "border-base-300 bg-base-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                {log.errorCode && (
                                  <div className="font-semibold text-error mb-1">
                                    {getErrorMessage(log.errorCode)}
                                  </div>
                                )}
                                {log.message && (
                                  <div className="text-base-content/80">
                                    {log.message}
                                  </div>
                                )}
                                {log.errorData && (
                                  <div className="mt-1 text-xs opacity-70">
                                    {formatError(log.errorCode, log.errorData)}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-base-content/60 whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString(
                                  "fr-FR",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Debug mode - WAHA response */}
                  {debugMode && message.wahaResponse && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="badge badge-sm">DEBUG</span>
                        Réponse WAHA :
                      </h4>
                      <div className="bg-base-300 rounded-lg p-3">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(message.wahaResponse, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Debug mode - Additional info */}
                  {debugMode && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="badge badge-sm">DEBUG</span>
                        Informations techniques :
                      </h4>
                      <div className="bg-base-300 rounded-lg p-3">
                        <dl className="text-sm space-y-1">
                          <div className="flex gap-2">
                            <dt className="font-mono text-xs text-base-content/60">
                              Group ID:
                            </dt>
                            <dd className="font-mono text-xs">
                              {message.groupId || "N/A"}
                            </dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="font-mono text-xs text-base-content/60">
                              Message ID:
                            </dt>
                            <dd className="font-mono text-xs">
                              {message._id || "N/A"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-12 text-base-content/60">
          Aucun message programmé
        </div>
      )}
    </div>
  );
};

export default SentMessagesList;
