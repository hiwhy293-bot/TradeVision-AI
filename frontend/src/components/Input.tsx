import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input
        className={`input-field ${error ? 'border-bearish' : ''} ${className || ''}`}
        {...props}
      />
      {error && <p className="text-bearish text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
