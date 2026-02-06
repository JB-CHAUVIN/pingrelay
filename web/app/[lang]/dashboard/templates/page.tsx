"use client";

import { useState, useEffect } from "react";
import useCrud from "@/hooks/useCrud";
import TemplateList from "@/components/_features/Dashboard/Templates/TemplateList";
import TemplateFormModal from "@/components/_features/Dashboard/Templates/TemplateFormModal";
import DeleteConfirmModal from "@/components/forms/DeleteConfirmModal";
import { Template } from "@/types/template.types";
import { Phone } from "@/types/phone.types";
import {
  TemplateCreateInput,
  TemplateUpdateInput,
} from "@/libs/validators/template.validator";
import apiClient from "@/libs/api";
import { useDictionary } from "@/i18n/dictionary-provider";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function TemplatesPage() {
  const { dict, lang } = useDictionary();
  const [hasAccess, setHasAccess] = useState(true);
  const [isAtTemplateLimit, setIsAtTemplateLimit] = useState(false);

  useEffect(() => {
    apiClient
      .get("/usage")
      .then((data: any) => {
        setHasAccess(data.hasAccess);
        if (data.usage.templatesLimit !== -1 && data.usage.templates >= data.usage.templatesLimit) {
          setIsAtTemplateLimit(true);
        }
      })
      .catch(() => {});
  }, []);
  const {
    items: templates,
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
  } = useCrud<Template, TemplateCreateInput, TemplateUpdateInput>({
    endpoint: "/templates",
    pageSize: 10,
  });

  const [phones, setPhones] = useState<Phone[]>([]);
  const [isLoadingPhones, setIsLoadingPhones] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhones = async () => {
      setIsLoadingPhones(true);
      try {
        const response: { items: Phone[] } = await apiClient.get(
          "/phones?limit=100",
        );
        setPhones(response.items);
      } catch (error) {
        console.error("Failed to fetch phones:", error);
      } finally {
        setIsLoadingPhones(false);
      }
    };

    fetchPhones();
  }, []);

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (templateToDelete) {
      await deleteItem(templateToDelete);
      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleFormSubmit = async (
    data: TemplateCreateInput | TemplateUpdateInput,
  ) => {
    if (selectedTemplate) {
      await updateItem(selectedTemplate.id, data as TemplateUpdateInput);
    } else {
      await createItem(data as TemplateCreateInput);
    }
    setIsFormModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{dict.templates.pageTitle}</h1>
              <p className="text-base-content/60 mt-1">
                {dict.templates.pageDescription}
              </p>
            </div>
            {hasAccess && !isAtTemplateLimit ? (
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={isLoadingPhones}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                {dict.templates.createTemplate}
              </button>
            ) : (
              <div className="tooltip" data-tip={!hasAccess ? dict.billing.subscriptionRequired : dict.billing.templateLimitReached}>
                <button className="btn btn-primary btn-disabled" disabled>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  {dict.templates.createTemplate}
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

          {hasAccess && isAtTemplateLimit && (
            <div className="alert alert-info mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">{dict.billing.templateLimitReached}</p>
                <p className="text-sm">{dict.billing.templateLimitReachedDesc}</p>
              </div>
              <Link href={`/${lang}/dashboard/billing`} className="btn btn-primary btn-sm">
                {dict.billing.goToBilling}
              </Link>
            </div>
          )}

          <TemplateList
            templates={templates}
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

      <TemplateFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        template={selectedTemplate}
        phones={phones}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title={dict.templates.deleteConfirmTitle}
        message={dict.templates.deleteConfirmMessage}
      />
    </div>
  );
}
