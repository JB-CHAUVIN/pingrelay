"use client";

import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import Input from "@/components/forms/Input";
import Select, { SelectOption } from "@/components/forms/Select";
import FormWrapper from "@/components/forms/FormWrapper";
import { Phone } from "@/types/phone.types";
import { phoneCreateSchema } from "@/libs/validators/phone.validator";
import { z } from "zod";
import { isDev } from "@/libs/dev";

interface PhoneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: Phone | null;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

const statusOptions: SelectOption[] = [
  { value: "connected", label: "Connecté" },
  { value: "disconnected", label: "Déconnecté" },
];

const PhoneFormModal: React.FC<PhoneFormModalProps> = ({
  isOpen,
  onClose,
  phone,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    phone: '',
    status: "disconnected" as "connected" | "disconnected",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or phone changes
  useEffect(() => {
    if (isOpen) {
      if (phone) {
        setFormData({
          phone: phone.phone,
          status: phone.status,
        });
      } else {
        // Pre-fill in dev mode
        if (isDev()) {
          setFormData({
            phone: "+33689639720",
            status: "disconnected",
          });
        } else {
          setFormData({
            phone: "",
            status: "disconnected",
          });
        }
      }
      setErrors({});
    }
  }, [isOpen, phone]);

  const validateForm = (): boolean => {
    try {
      phoneCreateSchema.parse(formData);
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        e.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
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
      // Error handled by useCrud hook
      console.error("Form submission error:", error);
    }
  };

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
              <Dialog.Panel className="relative w-full max-w-2xl h-full overflow-visible transform text-left align-middle shadow-xl transition-all rounded-xl bg-base-100 p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h2" className="font-semibold text-xl">
                    {phone ? "Modifier le numéro" : "Ajouter un numéro"}
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

                <FormWrapper
                  onSubmit={handleSubmit}
                  onCancel={onClose}
                  submitLabel={phone ? "Mettre à jour" : "Créer"}
                  isSubmitting={isSubmitting}
                >
                  <div className="space-y-4">
                    <Input
                      label="Numéro de téléphone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, phone: value }))
                      }
                      error={errors.phone}
                      placeholder="+33612345678"
                      helperText="Format international requis (ex: +33612345678)"
                      required
                      disabled={isSubmitting}
                    />

                    {phone && (
                      <Select
                        label="Statut"
                        name="status"
                        value={formData.status}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: value as "connected" | "disconnected",
                          }))
                        }
                        options={statusOptions}
                        error={errors.status}
                        disabled={isSubmitting}
                      />
                    )}
                  </div>
                </FormWrapper>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PhoneFormModal;
