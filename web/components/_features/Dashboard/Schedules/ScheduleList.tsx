import React from "react";
import { Schedule } from "@/types/schedule.types";
import ScheduleStatusBadge from "./ScheduleStatusBadge";

interface ScheduleListProps {
  schedules: Schedule[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onEdit: (schedule: Schedule) => void;
  onDelete: (scheduleId: string) => void;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  isLoading,
  currentPage,
  totalPages,
  onEdit,
  onDelete,
  onPageChange,
  onNextPage,
  onPrevPage,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-base-content/60 text-lg">Aucune programmation pour le moment</p>
        <p className="text-base-content/40 text-sm mt-2">
          Cliquez sur le bouton &quot;Créer une programmation&quot; pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Nom du groupe</th>
              <th>Modèle</th>
              <th>Date événement</th>
              <th>Statut</th>
              <th>Variables</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className="font-medium">{schedule.groupName}</td>
                <td>
                  {typeof schedule.messageTemplateId === 'object' && schedule.messageTemplateId
                    ? (schedule.messageTemplateId as any).titre
                    : 'Unknown'}
                </td>
                <td>
                  {new Date(schedule.eventDate).toLocaleString("fr-FR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>
                  <ScheduleStatusBadge status={schedule.status} />
                </td>
                <td>
                  <span className="badge badge-ghost">
                    {schedule.variables.length} variable{schedule.variables.length !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => onEdit(schedule)}
                      title="Modifier"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="btn btn-sm btn-ghost text-error"
                      onClick={() => onDelete(schedule.id)}
                      title="Supprimer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            className="btn btn-sm"
            onClick={onPrevPage}
            disabled={currentPage === 1}
          >
            Précédent
          </button>
          <span className="flex items-center px-4 text-sm">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            className="btn btn-sm"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleList;
