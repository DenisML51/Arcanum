// components/ui/form-field.tsx

import * as React from "react";
import { cn } from "./utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ 
  label, 
  required = false, 
  error, 
  children, 
  className 
}: FormFieldProps) {
  return (
    <div className={cn("form-field", className)}>
      <label className={cn("form-field-label", required && "required")}>
        {label}
      </label>
      {children}
      {error && (
        <span className="form-field-error-message">
          {error}
        </span>
      )}
    </div>
  );
}

interface FormInputProps extends React.ComponentProps<"input"> {
  error?: boolean;
}

export function FormInput({ 
  className, 
  error = false, 
  ...props 
}: FormInputProps) {
  return (
    <input
      className={cn(
        "form-field-input",
        error && "form-field-error",
        className
      )}
      {...props}
    />
  );
}

interface FormTextareaProps extends React.ComponentProps<"textarea"> {
  error?: boolean;
}

export function FormTextarea({ 
  className, 
  error = false, 
  ...props 
}: FormTextareaProps) {
  return (
    <textarea
      className={cn(
        "form-field-input form-field-textarea",
        error && "form-field-error",
        className
      )}
      {...props}
    />
  );
}

interface FormSelectProps extends React.ComponentProps<"select"> {
  error?: boolean;
}

export function FormSelect({ 
  className, 
  error = false, 
  ...props 
}: FormSelectProps) {
  return (
    <select
      className={cn(
        "form-field-select",
        error && "form-field-error",
        className
      )}
      {...props}
    />
  );
}
