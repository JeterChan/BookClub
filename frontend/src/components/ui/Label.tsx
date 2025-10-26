// frontend/src/components/ui/Label.tsx
import * as React from "react";
import { clsx } from "clsx";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={clsx(
      "block text-sm font-medium text-gray-700 mb-1",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
