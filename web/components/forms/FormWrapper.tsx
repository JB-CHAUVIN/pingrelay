import React from "react";

interface FormWrapperProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

const FormWrapper: React.FC<FormWrapperProps> = ({
  onSubmit,
  children,
  submitLabel = "Enregistrer",
  cancelLabel = "Annuler",
  onCancel,
  isSubmitting = false,
  className = "",
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
      <div className="flex gap-3 justify-end mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn btn-ghost"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting && <span className="loading loading-spinner loading-xs"></span>}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default FormWrapper;
