import React from "react";

interface PhoneStatusBadgeProps {
  status: "connected" | "disconnected";
}

const PhoneStatusBadge: React.FC<PhoneStatusBadgeProps> = ({ status }) => {
  const isConnected = status === "connected";

  return (
    <span
      className={`badge ${isConnected ? "badge-success" : "badge-error"} gap-2`}
    >
      <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-white" : "bg-white"}`}></span>
      {isConnected ? "Connected" : "Disconnected"}
    </span>
  );
};

export default PhoneStatusBadge;
