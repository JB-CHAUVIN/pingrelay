import React from "react";
import Input from "./Input";
import { VariableEntry } from "@/types/schedule.types";

interface VariablesFieldProps {
  label: string;
  value: VariableEntry[];
  onChange: (value: VariableEntry[]) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const VariablesField: React.FC<VariablesFieldProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  className = "",
}) => {
  const addVariable = () => {
    onChange([...value, { key: "", value: "" }]);
  };

  const removeVariable = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateVariable = (index: number, field: keyof VariableEntry, newValue: string) => {
    onChange(
      value.map((variable, i) =>
        i === index ? { ...variable, [field]: newValue } : variable
      )
    );
  };

  return (
    <div className={`form-control w-full ${className}`}>
      <label className="label">
        <span className="label-text">{label}</span>
      </label>

      <div className="space-y-3">
        {value.length === 0 ? (
          <p className="text-base-content/60 text-sm">No variables defined</p>
        ) : (
          value.map((variable, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Input
                label=""
                name={`variable-key-${index}`}
                value={variable.key}
                onChange={(newValue) => updateVariable(index, "key", newValue)}
                placeholder="variableName"
                disabled={disabled}
                className="flex-1"
              />
              <Input
                label=""
                name={`variable-value-${index}`}
                value={variable.value}
                onChange={(newValue) => updateVariable(index, "value", newValue)}
                placeholder="Variable value"
                disabled={disabled}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeVariable(index)}
                disabled={disabled}
                className="btn btn-ghost btn-sm text-error mt-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))
        )}

        <button
          type="button"
          onClick={addVariable}
          disabled={disabled}
          className="btn btn-sm btn-outline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add Variable
        </button>
      </div>

      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}

      <label className="label">
        <span className="label-text-alt text-base-content/60">
          Variables will replace placeholders like &#123;&#123;variableName&#125;&#125; in the message template
        </span>
      </label>
    </div>
  );
};

export default VariablesField;
