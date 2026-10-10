// app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  weight: ["400", "500", "700", "800"] 
});

const jetBrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});

// Tambahan font tulisan tangan untuk postcards
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwriting",
});

export const metadata: Metadata = {
  title: "Rudi | Personal Website",
  description: "Management × Tech Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} ${caveat.variable} font-sans antialiased bg-white text-gray-900`}>
        <Navbar />
        <main className="pt-28 min-h-screen container mx-auto px-6">
          {children}
        </main>
      </body>
    </html>
  );
}