"use client";

import { useState, useEffect } from "react";
import useCrud from "@/hooks/useCrud";
import ScheduleList from "@/components/_features/Dashboard/Schedules/ScheduleList";
import ScheduleFormModal from "@/components/_features/Dashboard/Schedules/ScheduleFormModal";
import DeleteConfirmModal from "@/components/forms/DeleteConfirmModal";
import { Schedule } from "@/types/schedule.types";
import { Template } from "@/types/template.types";
import { ScheduleCreateInput, ScheduleUpdateInput } from "@/libs/validators/schedule.validator";
import apiClient from "@/libs/api";
import { useDictionary } from "@/i18n/dictionary-provider";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SchedulesPage() {
  const { dict, lang } = useDictionary();
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    apiClient
      .get("/usage")
      .then((data: any) => setHasAccess(data.hasAccess))
      .catch(() => {});
  }, []);
  const {
    items: schedules,
    totalPages,
    currentPage,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createItem,
    updateItem,
    deleteItem,
    goToPage,
    nextPage,
    prevPage,
  } = useCrud<Schedule, ScheduleCreateInput, ScheduleUpdateInput>({
    endpoint: "/schedules",
    pageSize: 10,
  });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const response: { items: Template[] } = await apiClient.get("/templates?limit=100");
        setTemplates(response.items);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleCreate = () => {
    setSelectedSchedule(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (scheduleId: string) => {
    setScheduleToDelete(scheduleId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (scheduleToDelete) {
      await deleteItem(scheduleToDelete);
      setIsDeleteModalOpen(false);
      setScheduleToDelete(null);
    }
  };

  const handleFormSubmit = async (data: ScheduleCreateInput | ScheduleUpdateInput) => {
    if (selectedSchedule) {
      await updateItem(selectedSchedule.id, data as ScheduleUpdateInput);
    } else {
      await createItem(data as ScheduleCreateInput);
    }
    setIsFormModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{dict.schedules.pageTitle}</h1>
              <p className="text-base-content/60 mt-1">
                {dict.schedules.pageDescription}
              </p>
            </div>
            {hasAccess ? (
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={isLoadingTemplates}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                {dict.schedules.createSchedule}
              </button>
            ) : (
              <div className="tooltip" data-tip={dict.billing.subscriptionRequired}>
                <button className="btn btn-primary btn-disabled" disabled>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  {dict.schedules.createSchedule}
                </button>
              </div>
            )}
          </div>

          {!hasAccess && (
            <div className="alert alert-warning mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">{dict.billing.subscriptionRequired}</p>
                <p className="text-sm">{dict.billing.subscriptionRequiredDesc}</p>
              </div>
              <Link href={`/${lang}/dashboard/billing`} className="btn btn-primary btn-sm">
                {dict.billing.goToBilling}
              </Link>
            </div>
          )}

          <ScheduleList
            schedules={schedules}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
        </div>
      </div>

      <ScheduleFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        schedule={selectedSchedule}
        templates={templates}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title={dict.schedules.deleteConfirmTitle}
        message={dict.schedules.deleteConfirmMessage}
      />
    </div>
  );
}
