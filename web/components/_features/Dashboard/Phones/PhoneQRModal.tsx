"use client";

import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useRef, useState } from "react";

interface PhoneQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneId: string;
  phoneNumber: string;
  onConnectionSuccess: () => void;
}

const PhoneQRModal: React.FC<PhoneQRModalProps> = ({
  isOpen,
  onClose,
  phoneId,
  phoneNumber,
  onConnectionSuccess,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<string>("");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  console.log("[INFO] Open PhoneQRModal", isOpen, phoneId);

  // Load QR code when modal opens
  useEffect(() => {
    if (isOpen && phoneId) {
      loadQRCode();
      startPolling();
    } else {
      // Clean up when modal closes
      stopPolling();
      setQrCodeUrl(null);
      setError(null);
      setPollingStatus("");
    }

    return () => {
      stopPolling();
    };
  }, [isOpen, phoneId]);

  const loadQRCode = async () => {
    console.log("[QR Modal] Loading QR code for phone ID:", phoneId);
    setIsLoading(true);
    setError(null);

    // Let the backend handle session creation/starting
    // Just load the QR code directly
    const qrUrl = `/api/phones/${phoneId}/qr?t=${Date.now()}`;
    console.log("[QR Modal] QR URL:", qrUrl);
    setQrCodeUrl(qrUrl);
  };

  const handleImageLoad = () => {
    console.log("[QR Modal] Image loaded successfully");
    setIsLoading(false);
  };

  const handleImageError = (e: any) => {
    console.error("[QR Modal] Image load error:", e);
    setIsLoading(false);
    setError("Impossible de charger le QR code. Veuillez réessayer.");
  };

  const startPolling = () => {
    // Poll every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      checkStatus();
    }, 3000);

    setIsPolling(true);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  };

  const checkStatus = async () => {
    try {
      const response = await fetch(`/api/phones/${phoneId}/status`);

      if (!response.ok) {
        console.error("Failed to check status");
        return;
      }

      const data = await response.json();
      setPollingStatus(data.status);

      // If connected, start session and close modal
      if (data.connected) {
        stopPolling();

        try {
          // Start the session
          const startResponse = await fetch(`/api/phones/${phoneId}/start`, {
            method: "POST",
          });

          if (startResponse.ok) {
            // Notify parent component
            onConnectionSuccess();
            // Close modal
            onClose();
          }
        } catch (startError) {
          console.error("Failed to start session:", startError);
          setError("Connexion établie mais impossible de démarrer la session");
        }
      }
    } catch (err) {
      console.error("Error checking status:", err);
    }
  };

  const handleRetry = () => {
    setError(null);
    loadQRCode();
    startPolling();
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
              <Dialog.Panel className="relative w-full max-w-lg h-full overflow-visible transform text-left align-middle shadow-xl transition-all rounded-xl bg-base-100 p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h2" className="font-semibold text-xl">
                    Connecter WhatsApp
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    {isPolling && (
                      <span className="loading loading-spinner loading-sm"></span>
                    )}
                    <button
                      className="btn btn-square btn-ghost btn-sm"
                      onClick={onClose}
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
                </div>

                <div className="space-y-6">
                  {/* Phone number display */}
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
                      ></path>
                    </svg>
                    <span>
                      <strong>Numéro :</strong> {phoneNumber}
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-base font-semibold mb-2">
                      Instructions :
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Ouvrez WhatsApp sur votre téléphone</li>
                      <li>
                        Allez dans <strong>Paramètres</strong> &gt;{" "}
                        <strong>Appareils connectés</strong>
                      </li>
                      <li>
                        Appuyez sur <strong>Connecter un appareil</strong>
                      </li>
                      <li>Scannez le QR code ci-dessous</li>
                    </ol>
                  </div>

                  {/* QR Code Display */}
                  <div className="flex justify-center items-center bg-base-200 rounded-lg p-6 min-h-[320px]">
                    {isLoading && (
                      <div className="flex flex-col items-center justify-center min-h-[300px] w-full">
                        <div className="w-[300px] h-[300px] rounded-lg bg-white flex items-center justify-center shadow-md">
                          <span className="loading loading-spinner loading-lg"></span>
                        </div>
                        <p className="mt-4 text-sm text-base-content/70">
                          Chargement du QR code...
                        </p>
                      </div>
                    )}

                    {error && (
                      <div className="text-center space-y-4">
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
                          <span>{error}</span>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleRetry}
                        >
                          Réessayer
                        </button>
                      </div>
                    )}

                    {qrCodeUrl && !error && (
                      <div className="text-center space-y-2">
                        <img
                          src={qrCodeUrl}
                          alt="WhatsApp QR Code"
                          width={300}
                          height={300}
                          className="rounded-lg mx-auto shadow-md"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                        {pollingStatus && (
                          <p className="text-xs text-base-content/50">
                            Statut : {pollingStatus}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status indicator */}
                  {isPolling && !error && (
                    <div className="alert alert-success">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        En attente du scan... La modal se fermera
                        automatiquement une fois connecté.
                      </span>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PhoneQRModal;
