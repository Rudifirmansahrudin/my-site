import { ReactNode } from "react";

export function Chip({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <span className={`inline-block bg-gray-100 border border-gray-200 text-gray-700 text-xs font-mono px-3 py-1 rounded-full ${className}`}>
      {children}
    </span>
  );
}