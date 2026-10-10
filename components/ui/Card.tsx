// components/ui/Card.tsx
import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <div className={`bg-[#f1f4f9] border border-gray-200 rounded-[14px] p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}