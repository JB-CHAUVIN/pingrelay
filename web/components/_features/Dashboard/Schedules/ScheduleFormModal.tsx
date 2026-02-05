"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import React from "react";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import VariablesField from "@/components/forms/VariablesField";
import FormWrapper from "@/components/forms/FormWrapper";
import { Schedule, VariableEntry } from "@/types/schedule.types";
import { Template } from "@/types/template.types";
import { scheduleCreateSchema } from "@/libs/validators/schedule.validator";
import { z } from "zod";

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  templates: Template[];
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  isOpen,
  onClose,
  schedule,
  templates,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    groupName: "",
    messageTemplateId: "",
    eventDate: "",
    variables: [] as VariableEntry[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (schedule) {
        const date = new Date(schedule.eventDate);
        const formattedDate = date.toISOString().slice(0, 16);

        setFormData({
          groupName: schedule.groupName,
          messageTemplateId: schedule.messageTemplateId,
          eventDate: formattedDate,
          variables: schedule.variables || [],
        });
      } else {
        setFormData({
          groupName: "",
          messageTemplateId: "",
          eventDate: "",
          variables: [],
        });
      }
      setErrors({});
    }
  }, [isOpen, schedule]);

  const validateForm = (): boolean => {
    try {
      scheduleCreateSchema.parse(formData);
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        e.errors.forEach((err) => {
          const path = err.path.join(".");
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const templateOptions = templates.map((template) => ({
    value: template.id,
    label: template.titre,
  }));

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-focus bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full overflow-hidden items-start md:items-center justify-center p-2">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-3xl h-full max-h-[90vh] overflow-visible transform text-left align-middle shadow-xl transition-all rounded-xl bg-base-100 p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h2" className="font-semibold text-xl">
                    {schedule ? "Modifier la programmation" : "Créer une programmation"}
                  </Dialog.Title>
                  <button
                    className="btn btn-square btn-ghost btn-sm"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                  <FormWrapper
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    submitLabel={schedule ? "Mettre à jour" : "Créer"}
                    isSubmitting={isSubmitting}
                  >
                    <div className="space-y-4">
                      <Input
                        label="Nom du groupe"
                        name="groupName"
                        value={formData.groupName}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, groupName: value }))
                        }
                        error={errors.groupName}
                        placeholder="Webinar attendees batch 1"
                        required
                        disabled={isSubmitting}
                      />

                      <Select
                        label="Modèle de message"
                        name="messageTemplateId"
                        value={formData.messageTemplateId}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            messageTemplateId: value,
                          }))
                        }
                        options={templateOptions}
                        error={errors.messageTemplateId}
                        placeholder="Select a template"
                        required
                        disabled={isSubmitting}
                      />

                      <div className="form-control w-full">
                        <label htmlFor="eventDate" className="label">
                          <span className="label-text">
                            Date et heure de l&apos;événement
                            <span className="text-error ml-1">*</span>
                          </span>
                        </label>
                        <input
                          id="eventDate"
                          name="eventDate"
                          type="datetime-local"
                          value={formData.eventDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              eventDate: e.target.value,
                            }))
                          }
                          disabled={isSubmitting}
                          required
                          className={`input input-bordered w-full ${
                            errors.eventDate ? "input-error" : ""
                          }`}
                        />
                        {errors.eventDate && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.eventDate}
                            </span>
                          </label>
                        )}
                      </div>

                      <VariablesField
                        label="Variables"
                        value={formData.variables}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, variables: value }))
                        }
                        error={errors.variables}
                        disabled={isSubmitting}
                      />
                    </div>
                  </FormWrapper>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ScheduleFormModal;
