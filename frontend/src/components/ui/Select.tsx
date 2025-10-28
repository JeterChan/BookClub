// frontend/src/components/ui/Select.tsx
import * as React from "react";
import { clsx } from "clsx";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.HTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      className={clsx(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  // This is a conceptual component for compatibility with shadcn-like structure.
  // In a real HTML select, the value is handled by the select element itself.
  // We can render a disabled placeholder option.
  return <option value="" disabled>{placeholder}</option>;
};

const SelectTrigger = ({ children }: React.PropsWithChildren<{}>) => {
  // This component is also conceptual for structure.
  // The `Select` component itself is the trigger.
  return <>{children}</>;
};

const SelectContent = ({ children }: React.PropsWithChildren<{}>) => {
  // The children (SelectItems) are passed directly to the Select component.
  return <>{children}</>;
};

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, ...props }, ref) => {
  return (
    <option
      className={clsx("text-black", className)}
      ref={ref}
      {...props}
    >
      {children}
    </option>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };
