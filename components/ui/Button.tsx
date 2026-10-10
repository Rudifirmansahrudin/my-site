import { ButtonHTMLAttributes } from "react";

export function Button({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button 
      className={`bg-indigo-600 text-white font-sans font-bold px-6 py-2.5 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}