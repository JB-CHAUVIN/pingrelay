import React from "react";

interface ScheduleStatusBadgeProps {
  status: "pending" | "running" | "completed" | "failed";
}

const ScheduleStatusBadge: React.FC<ScheduleStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: {
      label: "Non démarré",
      className: "badge-warning",
    },
    running: {
      label: "En cours",
      className: "badge-info",
    },
    completed: {
      label: "Terminé",
      className: "badge-success",
    },
    failed: {
      label: "Échoué",
      className: "badge-error",
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
};

export default ScheduleStatusBadge;
