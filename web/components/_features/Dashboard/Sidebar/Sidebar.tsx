"use client";
import React, { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const selectedClass = "bg-gray-100";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const path = usePathname();

  const isSelected = (name: string) => {
    return path === name;
  };

  const renderItem = (href: string, emoji: string, title: string) => {
    return (
      <a
        href={href}
        onClick={onClose}
        className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200 rounded-lg font-medium ${isSelected(href) ? selectedClass : ""}`}
      >
        <span className="mr-3">{emoji}</span> {title}
      </a>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Image
            src="/logo-pingrelay-automation-whatsapp-automatisation-webinar.png"
            alt="Logo Pingrelay - Automatisation Webinar for WhatsApp"
            width={50}
            height={50}
            className="rounded-md"
          />
          Pingrelay
        </h2>

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="md:hidden btn btn-ghost btn-sm btn-square"
          aria-label="Fermer le menu"
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

      {/* Navigation */}
      <nav className="px-6 space-y-2 flex-1">
        {renderItem("/dashboard", "🏠", "Tableau de bord")}
        {renderItem("/dashboard/phones", "📱", "Numéros")}
        {renderItem("/dashboard/templates", "💬", "Modèles de messages")}
        {renderItem("/dashboard/schedules", "📅", "Programmation")}
      </nav>
    </div>
  );
};

export default Sidebar;
