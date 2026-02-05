import React from "react";
import Select from "./Select";
import Input from "./Input";

interface DaySelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const DaySelector: React.FC<DaySelectorProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
}) => {
  const parseValue = (val: string) => {
    // Ensure val is a string and handle undefined/null
    if (!val && val !== "0") {
      return { type: "dday", days: "" };
    }

    const strVal = String(val);

    if (strVal === "0") {
      return { type: "dday", days: "" };
    }
    const num = parseInt(strVal);
    if (isNaN(num)) {
      return { type: "dday", days: "" };
    }
    if (num < 0) {
      return { type: "before", days: Math.abs(num).toString() };
    }
    return { type: "after", days: num.toString() };
  };

  const { type, days } = parseValue(value);

  const handleTypeChange = (newType: string) => {
    if (newType === "dday") {
      onChange("0");
    } else {
      const currentDays = days || "1";
      onChange(newType === "before" ? `-${currentDays}` : currentDays);
    }
  };

  const handleDaysChange = (newDays: string) => {
    const numDays = parseInt(newDays) || 0;
    if (numDays <= 0) {
      onChange(type === "before" ? "-1" : "1");
      return;
    }
    onChange(type === "before" ? `-${numDays}` : numDays.toString());
  };

  return (
    <div className={`form-control w-full ${className}`}>
      <label className="label">
        <span className="label-text">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      <div className="flex gap-2">
        <Select
          key={`daytype-${value}`}
          label=""
          name="dayType"
          value={type}
          onChange={handleTypeChange}
          options={[
            { value: "before", label: "Before Event" },
            { value: "dday", label: "D-Day" },
            { value: "after", label: "After Event" },
          ]}
          disabled={disabled}
          placeholder=""
          className="flex-1"
        />
        {type !== "dday" && (
          <Input
            label=""
            name="dayCount"
            type="number"
            value={days}
            onChange={handleDaysChange}
            placeholder="Days"
            disabled={disabled}
            className="w-24"
          />
        )}
      </div>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
      <label className="label">
        <span className="label-text-alt text-base-content/60">
          {type === "dday" && "Message sent on event day"}
          {type === "before" && `Message sent ${days || "?"} day(s) before event`}
          {type === "after" && `Message sent ${days || "?"} day(s) after event`}
        </span>
      </label>
    </div>
  );
};

export default DaySelector;
