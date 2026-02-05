"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import apiClient from "@/libs/api";
import ScheduleStatusBadge from "@/components/_features/Dashboard/Schedules/ScheduleStatusBadge";
import SentMessagesList from "@/components/_features/Dashboard/Schedules/SentMessagesList";
import SentMessagesStats from "@/components/_features/Dashboard/Schedules/SentMessagesStats";
import { sortMessagesBySchedule } from "@/libs/message-sort";
import { useDictionary } from "@/i18n/dictionary-provider";

interface SentMessage {
  messageIndex: number;
  sendOnDay: string;
  sendOnHour: string;
  messageTemplate: string;
  image?: string;
  video?: string;
  phone: string | null;
  status: "sent" | "failed" | "pending" | "not_sent";
  sentAt: string | null;
  wahaResponse: any;
  error: string | null;
  groupId: string | null;
  _id: string | null;
}

interface Stats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  not_sent: number;
}

interface ScheduleDetails {
  _id: string;
  groupName: string;
  eventDate: string;
  status: "pending" | "running" | "completed" | "failed";
  variables: Array<{ key: string; value: string }>;
}

interface ApiResponse {
  schedule: ScheduleDetails;
  messages: SentMessage[];
  stats: Stats;
}

export default function ScheduleDetailsPage() {
  const params = useParams();
  const { dict, lang } = useDictionary();
  const scheduleId = params.id as string;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const response = await apiClient.get<ApiResponse>(
        `/schedules/${scheduleId}/sent-messages`,
      );
      setData(response);
    } catch (err) {
      console.error("Failed to fetch schedule details:", err);
      setError(dict.schedules.detailsErrorLoad);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [scheduleId]);

  // Auto-refresh every 30 seconds if enabled and schedule is running
  useEffect(() => {
    if (!autoRefresh || !data || data.schedule.status === "completed") {
      return;
    }

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="alert alert-error max-w-md">
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
          <span>{error || dict.schedules.detailsErrorUnknown}</span>
        </div>
        <Link href={`/${lang}/dashboard/schedules`} className="btn btn-primary mt-4">
          {dict.schedules.detailsBackButton}
        </Link>
      </div>
    );
  }

  const { schedule, messages, stats } = data;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/${lang}/dashboard/schedules`}
            className="btn btn-ghost btn-sm mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            {dict.schedules.detailsBackButton}
          </Link>

          <div className="bg-base-100 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{schedule.groupName}</h1>
                <div className="flex gap-4 items-center text-base-content/60">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      {new Date(schedule.eventDate).toLocaleString(lang === "fr" ? "fr-FR" : lang === "en" ? "en-US" : lang === "es" ? "es-ES" : lang === "it" ? "it-IT" : "de-DE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <ScheduleStatusBadge status={schedule.status} />
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <div className="form-control">
                  <label className="label cursor-pointer gap-2">
                    <span className="label-text text-sm">{dict.schedules.detailsAutoRefresh}</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-sm toggle-primary"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                  </label>
                </div>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={fetchData}
                  title={dict.schedules.detailsRefreshButton}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Variables */}
            {schedule.variables && schedule.variables.length > 0 && (
              <div className="mt-4 pt-4 border-t border-base-300">
                <h3 className="text-sm font-semibold mb-2">{dict.schedules.variablesLabel}</h3>
                <div className="flex flex-wrap gap-2">
                  {schedule.variables.map((variable, index) => (
                    <div key={index} className="badge badge-ghost">
                      <span className="font-mono text-xs">
                        {`{{${variable.key}}}`}
                      </span>
                      <span className="mx-1">→</span>
                      <span>{variable.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <SentMessagesStats stats={stats} />

        {/* Messages List */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">{dict.schedules.detailsScheduledMessages}</h2>
          <SentMessagesList
            messages={sortMessagesBySchedule(messages)}
            eventDate={schedule.eventDate}
          />
        </div>
      </div>
    </div>
  );
}
