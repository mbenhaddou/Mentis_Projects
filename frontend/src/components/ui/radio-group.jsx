// src/components/ui/radio-group.jsx
import React from 'react';

// RadioGroup acts as a container for the radio items.
export const RadioGroup = ({ children, className = '', ...props }) => {
  return (
    <div role="radiogroup" className={className} {...props}>
      {children}
    </div>
  );
};

// RadioGroupItem renders an individual radio button.
// Using React.forwardRef to support ref forwarding (useful for react-hook-form).
export const RadioGroupItem = React.forwardRef(({ value, id, className = '', ...props }, ref) => {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      ref={ref}
      // Basic styling: you can adjust or add more classes as needed.
      className={`form-radio h-4 w-4 text-indigo-600 ${className}`}
      {...props}
    />
  );
});

RadioGroupItem.displayName = 'RadioGroupItem';
