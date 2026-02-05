import React from "react";

interface ScheduleStatusBadgeProps {
  status: "pending" | "running" | "completed" | "failed";
}

const ScheduleStatusBadge: React.FC<ScheduleStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "badge-warning",
    },
    running: {
      label: "Running",
      className: "badge-info",
    },
    completed: {
      label: "Completed",
      className: "badge-success",
    },
    failed: {
      label: "Failed",
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
