import React from "react";

export function Select({ children, className = "" }) {
  return (
    <div className={`relative inline-block w-full ${className}`}>{children}</div>
  );
}

export function SelectTrigger({ children, ...props }) {
  return (
    <button
      {...props}
      className="border border-gray-300 rounded-lg p-2 w-full text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {children}
    </button>
  );
}

export function SelectContent({ children }) {
  return (
    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
      {children}
    </div>
  );
}

export function SelectItem({ children, value, onClick }) {
  return (
    <div
      onClick={() => onClick?.(value)}
      className="p-2 cursor-pointer hover:bg-blue-100"
    >
      {children}
    </div>
  );
}

export function SelectValue({ value }) {
  return <span>{value || "اختر قيمة"}</span>;
}