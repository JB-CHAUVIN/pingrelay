"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import React from "react";
import { MODAL_BACKDROP_CLASSES } from "@/components/ModalBackdrop";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import TextArea from "@/components/forms/TextArea";
import TimePicker from "@/components/forms/TimePicker";
import DaySelector from "@/components/forms/DaySelector";
import FormWrapper from "@/components/forms/FormWrapper";
import { Template, TemplateMessage } from "@/types/template.types";
import { Phone } from "@/types/phone.types";
import { templateCreateSchema } from "@/libs/validators/template.validator";
import { z } from "zod";
import { sortMessagesBySchedule } from "@/libs/message-sort";

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  phones: Phone[];
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

const emptyMessage: TemplateMessage = {
  phoneId: "",
  sendTimeType: "fixed_time",
  sendOnDay: "0",
  sendOnHour: "09:00",
  messageTemplate: "",
  image: "",
  video: "",
};

const sendTimeTypeOptions = [
  { value: "fixed_time", label: "Heure fixe (D-day, avant/après événement)" },
  { value: "event_time", label: "À l'heure de l'événement" },
  { value: "relative_time", label: "Relatif à l'événement (+/- jours/heures)" },
];

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  isOpen,
  onClose,
  template,
  phones,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    titre: "",
    messages: [{ ...emptyMessage }] as TemplateMessage[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedMessages, setExpandedMessages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      if (template) {
        const messages = Array.isArray(template.messages) && template.messages.length > 0
          ? template.messages.map(msg => ({
              ...msg,
              // Extract phoneId if it's an object (populated from API)
              phoneId: typeof msg.phoneId === 'object' && msg.phoneId !== null
                ? (msg.phoneId as any).id || (msg.phoneId as any)._id || msg.phoneId
                : msg.phoneId,
              // Ensure sendTimeType exists (backward compatibility)
              sendTimeType: msg.sendTimeType || "fixed_time",
            }))
          : [{ ...emptyMessage }];

        console.log("[Template Form] Loaded messages:", messages);

        setFormData({
          titre: template.titre || "",
          messages: messages,
        });

        // Initialize all messages as expanded
        const expanded: Record<number, boolean> = {};
        messages.forEach((_, index) => {
          expanded[index] = false;
        });
        setExpandedMessages(expanded);
      } else {
        setFormData({
          titre: "",
          messages: [{ ...emptyMessage }],
        });
        setExpandedMessages({ 0: true });
      }
      setErrors({});
    }
  }, [isOpen, template]);

  const validateForm = (): boolean => {
    try {
      templateCreateSchema.parse(formData);
      setErrors({});
      return true;
    } catch (e) {
      console.error("Validation error:", e);
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        if (e.errors && Array.isArray(e.errors)) {
          e.errors.forEach((err) => {
            const path = err.path.join(".");
            newErrors[path] = err.message;
          });
        }
        setErrors(newErrors);
      } else {
        console.error("Non-Zod validation error:", e);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Template Form] Submitting data:", formData);
    if (!validateForm()) {
      console.log("[Template Form] Validation failed, errors:", errors);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    }
  };

  const addMessage = () => {
    const newIndex = formData.messages.length;
    setFormData((prev) => ({
      ...prev,
      messages: [...prev.messages, { ...emptyMessage }],
    }));
    setExpandedMessages((prev) => ({ ...prev, [newIndex]: true }));
    setSendTimeTypes((prev) => ({ ...prev, [newIndex]: "fixed_time" }));
  };

  const removeMessage = (index: number) => {
    if (formData.messages.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index),
    }));

    // Clean up expanded state
    const newExpanded = { ...expandedMessages };
    delete newExpanded[index];
    setExpandedMessages(newExpanded);

    // Clean up send time type
    const newTypes = { ...sendTimeTypes };
    delete newTypes[index];
    setSendTimeTypes(newTypes);
  };

  const toggleMessage = (index: number) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const updateMessage = (index: number, field: keyof TemplateMessage, value: string) => {
    setFormData((prev) => ({
      ...prev,
      messages: prev.messages.map((msg, i) =>
        i === index ? { ...msg, [field]: value } : msg
      ),
    }));
  };

  const updateSendTimeType = (index: number, type: string) => {
    setFormData((prev) => ({
      ...prev,
      messages: prev.messages.map((msg, i) => {
        if (i === index) {
          const updated = { ...msg, sendTimeType: type as any };

          // Reset values based on type
          if (type === "event_time") {
            updated.sendOnDay = "0";
            updated.sendOnHour = "00:00";
          } else if (type === "relative_time") {
            // For relative_time: sendOnDay = days (can be negative), sendOnHour = hours in HH:MM format
            updated.sendOnDay = "0";
            updated.sendOnHour = "00:00";
          } else if (type === "fixed_time") {
            // Keep current values or set defaults
            if (!updated.sendOnDay || updated.sendOnDay === "0") {
              updated.sendOnDay = "0";
            }
            if (!updated.sendOnHour || updated.sendOnHour === "00:00") {
              updated.sendOnHour = "09:00";
            }
          }

          return updated;
        }
        return msg;
      }),
    }));
  };

  // Helper to update relative time values (for relative_time mode)
  const updateRelativeTime = (index: number, days: string, hours: string) => {
    setFormData((prev) => ({
      ...prev,
      messages: prev.messages.map((msg, i) => {
        if (i === index) {
          // Convert days and hours to sendOnDay and sendOnHour
          // For "1 jour et 3 heures avant" → days="-1", hours="-3" → sendOnDay="-1", sendOnHour="03:00"
          const numDays = parseInt(days) || 0;
          const numHours = Math.abs(parseInt(hours) || 0);

          return {
            ...msg,
            sendOnDay: numDays.toString(),
            sendOnHour: `${numHours.toString().padStart(2, '0')}:00`,
          };
        }
        return msg;
      }),
    }));
  };

  const getMessagePreview = (message: string) => {
    if (!message) return "Aucun contenu pour le moment...";
    return message.length > 200 ? message.substring(0, 200) + "..." : message;
  };

  const getMessageDate = (message: TemplateMessage) => {
    const type = message.sendTimeType || "fixed_time";

    if (type === "event_time") {
      return "📅 À l'heure exacte de l'événement";
    }

    if (type === "relative_time") {
      const days = parseInt(message.sendOnDay || "0");
      const hours = parseInt(message.sendOnHour.split(':')[0] || "0");

      if (days === 0 && hours === 0) {
        return "📅 À l'heure de l'événement";
      }

      const parts: string[] = [];

      if (days !== 0) {
        const dayLabel = Math.abs(days) === 1 ? "jour" : "jours";
        parts.push(`${Math.abs(days)} ${dayLabel}`);
      }

      if (hours !== 0) {
        const hourLabel = Math.abs(hours) === 1 ? "heure" : "heures";
        parts.push(`${Math.abs(hours)} ${hourLabel}`);
      }

      const timeStr = parts.join(" et ");
      const prefix = (days < 0 || (days === 0 && hours < 0)) ? "⏪" : "⏩";
      const direction = (days < 0 || (days === 0 && hours < 0)) ? "avant" : "après";

      return `${prefix} ${timeStr} ${direction} l'événement`;
    }

    // fixed_time
    const dayMap: Record<string, string> = {
      "-7": "J-7",
      "-6": "J-6",
      "-5": "J-5",
      "-4": "J-4",
      "-3": "J-3",
      "-2": "J-2",
      "-1": "J-1",
      "0": "J-day",
      "1": "J+1",
      "2": "J+2",
      "3": "J+3",
      "4": "J+4",
      "5": "J+5",
      "6": "J+6",
      "7": "J+7",
    };

    const dayLabel = dayMap[message.sendOnDay] || `J${message.sendOnDay > "0" ? "+" : ""}${message.sendOnDay}`;
    return `📅 ${dayLabel} à ${message.sendOnHour}`;
  };

  const phoneOptions = phones.map((phone) => ({
    value: phone.id,
    label: phone.phone,
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
          <div className={MODAL_BACKDROP_CLASSES} />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full overflow-hidden items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-[95vw] h-[95vh] overflow-visible transform text-left align-middle shadow-xl transition-all rounded-xl bg-base-100 p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h2" className="font-semibold text-xl">
                    {template ? "Modifier le modèle" : "Créer un modèle"}
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

                <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
                  <FormWrapper
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    submitLabel={template ? "Mettre à jour" : "Créer"}
                    isSubmitting={isSubmitting}
                  >
                    <div className="space-y-6">
                      <Input
                        label="Titre du modèle"
                        name="titre"
                        value={formData.titre}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, titre: value }))
                        }
                        error={errors.titre}
                        placeholder="Mon modèle de messages"
                        required
                        disabled={isSubmitting}
                      />

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Messages</h3>
                          <button
                            type="button"
                            onClick={addMessage}
                            disabled={isSubmitting}
                            className="btn btn-sm btn-primary"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                            Ajouter un message
                          </button>
                        </div>

                        {sortMessagesBySchedule(
                          formData.messages.map((msg, idx) => ({ ...msg, originalIndex: idx }))
                        ).map((message) => {
                          const originalIndex = message.originalIndex;
                          return (
                          <div
                            key={originalIndex}
                            className="border border-base-300 rounded-lg overflow-hidden"
                          >
                            {/* Message Header */}
                            <div className="p-4 bg-base-200">
                              <div className="flex justify-between items-start">
                                <button
                                  type="button"
                                  onClick={() => toggleMessage(originalIndex)}
                                  className="flex-1 text-left flex items-start gap-2"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className={`w-5 h-5 transition-transform ${
                                      expandedMessages[originalIndex] ? "rotate-180" : ""
                                    }`}
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <div className="flex-1">
                                    <h4 className="font-medium">Message {originalIndex + 1}</h4>
                                    <p className="text-sm text-base-content/60 mt-1">
                                      {getMessagePreview(message.messageTemplate)}
                                    </p>
                                    <p className="text-sm text-base-content/60 mt-1">
                                      {getMessageDate(message)}
                                    </p>
                                  </div>
                                </button>

                                {formData.messages.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeMessage(originalIndex)}
                                    disabled={isSubmitting}
                                    className="btn btn-sm btn-ghost text-error ml-2"
                                  >
                                    Supprimer
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Message Content */}
                            {expandedMessages[originalIndex] && (
                              <div className="p-4 space-y-4">
                                <Select
                                  label="Numéro de téléphone"
                                  name={`messages.${originalIndex}.phoneId`}
                                  value={message.phoneId}
                                  onChange={(value) =>
                                    updateMessage(originalIndex, "phoneId", value)
                                  }
                                  options={phoneOptions}
                                  error={errors[`messages.${originalIndex}.phoneId`]}
                                  placeholder="Sélectionnez un numéro"
                                  required
                                  disabled={isSubmitting}
                                />

                                <Select
                                  label="Type de planification"
                                  name={`messages.${originalIndex}.sendTimeType`}
                                  value={message.sendTimeType || "fixed_time"}
                                  onChange={(value) => updateSendTimeType(originalIndex, value)}
                                  options={sendTimeTypeOptions}
                                  disabled={isSubmitting}
                                />

                                {/* Fixed Time Mode */}
                                {message.sendTimeType === "fixed_time" && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <DaySelector
                                      label="Jour d'envoi"
                                      value={message.sendOnDay}
                                      onChange={(value) =>
                                        updateMessage(originalIndex, "sendOnDay", value)
                                      }
                                      error={errors[`messages.${originalIndex}.sendOnDay`]}
                                      required
                                      disabled={isSubmitting}
                                    />

                                    <TimePicker
                                      label="Heure d'envoi"
                                      name={`messages.${originalIndex}.sendOnHour`}
                                      value={message.sendOnHour}
                                      onChange={(value) =>
                                        updateMessage(originalIndex, "sendOnHour", value)
                                      }
                                      error={errors[`messages.${originalIndex}.sendOnHour`]}
                                      required
                                      disabled={isSubmitting}
                                    />
                                  </div>
                                )}

                                {/* Event Time Mode */}
                                {message.sendTimeType === "event_time" && (
                                  <div className="alert alert-info">
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
                                      />
                                    </svg>
                                    <span>
                                      Le message sera envoyé exactement à la date et heure de l'événement
                                    </span>
                                  </div>
                                )}

                                {/* Relative Time Mode */}
                                {message.sendTimeType === "relative_time" && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <Input
                                        label="Jours (avant: -, après: +)"
                                        name={`messages.${originalIndex}.relativeDays`}
                                        type="number"
                                        value={message.sendOnDay}
                                        onChange={(value) => {
                                          const hours = message.sendOnHour.split(':')[0];
                                          updateRelativeTime(originalIndex, value, hours);
                                        }}
                                        placeholder="0"
                                        disabled={isSubmitting}
                                      />

                                      <Input
                                        label="Heures (avant: -, après: +)"
                                        name={`messages.${originalIndex}.relativeHours`}
                                        type="number"
                                        value={message.sendOnHour.split(':')[0]}
                                        onChange={(value) => {
                                          updateRelativeTime(originalIndex, message.sendOnDay, value);
                                        }}
                                        placeholder="0"
                                        disabled={isSubmitting}
                                      />
                                    </div>
                                    <div className="alert alert-info">
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
                                        />
                                      </svg>
                                      <span className="text-sm">
                                        Exemple : -1 jour et -3 heures = 1 jour et 3 heures avant l'événement<br />
                                        Exemple : 0 jour et 2 heures = 2 heures après l'événement
                                      </span>
                                    </div>
                                  </div>
                                )}

                                <TextArea
                                  label="Contenu du message"
                                  name={`messages.${originalIndex}.messageTemplate`}
                                  value={message.messageTemplate}
                                  onChange={(value) =>
                                    updateMessage(originalIndex, "messageTemplate", value)
                                  }
                                  error={errors[`messages.${originalIndex}.messageTemplate`]}
                                  placeholder="Utilisez {{variable}} pour le contenu dynamique"
                                  required
                                  disabled={isSubmitting}
                                  rows={4}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                  <Input
                                    label="URL de l'image (optionnel)"
                                    name={`messages.${originalIndex}.image`}
                                    value={message.image || ""}
                                    onChange={(value) =>
                                      updateMessage(originalIndex, "image", value)
                                    }
                                    error={errors[`messages.${originalIndex}.image`]}
                                    placeholder="https://exemple.com/image.jpg"
                                    disabled={isSubmitting}
                                  />

                                  <Input
                                    label="URL de la vidéo (optionnel)"
                                    name={`messages.${originalIndex}.video`}
                                    value={message.video || ""}
                                    onChange={(value) =>
                                      updateMessage(originalIndex, "video", value)
                                    }
                                    error={errors[`messages.${originalIndex}.video`]}
                                    placeholder="https://exemple.com/video.mp4"
                                    disabled={isSubmitting}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                        })}
                      </div>
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

export default TemplateFormModal;
