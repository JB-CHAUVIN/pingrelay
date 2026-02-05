"use client";

import { useState } from "react";
import useCrud from "@/hooks/useCrud";
import PhoneList from "@/components/_features/Dashboard/Phones/PhoneList";
import PhoneFormModal from "@/components/_features/Dashboard/Phones/PhoneFormModal";
import PhoneQRModal from "@/components/_features/Dashboard/Phones/PhoneQRModal";
import DeleteConfirmModal from "@/components/forms/DeleteConfirmModal";
import { Phone } from "@/types/phone.types";
import { PhoneCreateInput, PhoneUpdateInput } from "@/libs/validators/phone.validator";
import { toast } from "react-hot-toast";

export const dynamic = "force-dynamic";

export default function PhonesPage() {
  const {
    items: phones,
    totalPages,
    currentPage,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createItem,
    updateItem,
    deleteItem,
    fetchItems,
    goToPage,
    nextPage,
    prevPage,
  } = useCrud<Phone, PhoneCreateInput, PhoneUpdateInput>({
    endpoint: "/phones",
    pageSize: 10,
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [phoneToDelete, setPhoneToDelete] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedPhoneForQR, setSelectedPhoneForQR] = useState<Phone | null>(null);

  const handleCreate = () => {
    setSelectedPhone(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (phone: Phone) => {
    setSelectedPhone(phone);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (phoneId: string) => {
    setPhoneToDelete(phoneId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    console.log("[DEBUG] handleDeleteConfirm called with phoneToDelete:", phoneToDelete);
    if (phoneToDelete) {
      try {
        console.log("[DEBUG] Calling deleteItem with ID:", phoneToDelete);
        await deleteItem(phoneToDelete);
        console.log("[DEBUG] deleteItem succeeded, closing modal");
        setIsDeleteModalOpen(false);
        setPhoneToDelete(null);
      } catch (error) {
        // Error is already handled by apiClient interceptor
        console.error("[ERROR] Failed to delete phone:", error);
      }
    } else {
      console.warn("[WARN] phoneToDelete is null or undefined");
    }
  };

  const handleConnect = (phone: Phone) => {
    console.log('[INFO] Handle connect phone', phone);
    setSelectedPhoneForQR(phone);
    setIsQRModalOpen(true);
  };

  const handleConnectionSuccess = () => {
    fetchItems(currentPage);
    toast.success("WhatsApp connecté avec succès !");
  };

  const handleFormSubmit = async (data: PhoneCreateInput | PhoneUpdateInput) => {
    if (selectedPhone) {
      await updateItem(selectedPhone.id, data as PhoneUpdateInput);
      setIsFormModalOpen(false);
    } else {
      const newPhone = await createItem(data as PhoneCreateInput);
      setIsFormModalOpen(false);
      // Auto-open QR modal after creating a new phone
      setSelectedPhoneForQR(newPhone);
      setIsQRModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Numéros de téléphone</h1>
              <p className="text-base-content/60 mt-1">
                Gérez vos numéros pour l&apos;automatisation WhatsApp
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleCreate}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Ajouter un numéro
            </button>
          </div>

          <PhoneList
            phones={phones}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onConnect={handleConnect}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
        </div>
      </div>

      <PhoneFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        phone={selectedPhone}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <PhoneQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        phoneId={selectedPhoneForQR?.id || ""}
        phoneNumber={selectedPhoneForQR?.phone || ""}
        onConnectionSuccess={handleConnectionSuccess}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Supprimer le numéro"
        message="Êtes-vous sûr de vouloir supprimer ce numéro de téléphone ? Cette action est irréversible."
      />
    </div>
  );
}
