// src/components/ui/checkbox.jsx
import React from 'react';

// A basic checkbox component that supports ref forwarding.
export const Checkbox = React.forwardRef(({ id, className = '', ...props }, ref) => {
  return (
    <input
      type="checkbox"
      id={id}
      ref={ref}
      className={`form-checkbox h-4 w-4 text-indigo-600 ${className}`}
      {...props}
    />
  );
});

Checkbox.displayName = 'Checkbox';
