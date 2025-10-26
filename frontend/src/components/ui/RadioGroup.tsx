// frontend/src/components/ui/RadioGroup.tsx
import * as React from "react";
import { clsx } from "clsx";

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onValueChange?: (value: string) => void; defaultValue?: string; }
>(({ className, onValueChange, defaultValue, children, ...props }, ref) => {
  // The state and logic would be managed by a form library like react-hook-form
  // This component just provides the structure and styling.
  return (
    <div role="radiogroup" ref={ref} className={clsx("flex items-center gap-x-4", className)} {...props}>
      {children}
    </div>
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      type="radio"
      ref={ref}
      className={clsx(
        "h-4 w-4 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500",
        className
      )}
      {...props}
    />
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
