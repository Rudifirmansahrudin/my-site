"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
import React from "react";

export default function TiltCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  // Mengatur seberapa ekstrem kemiringannya
  const rotateX = useTransform(y, [0, 400], [10, -10]);
  const rotateY = useTransform(x, [0, 400], [-10, 10]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={() => {
        x.set(200);
        y.set(200); // Balik ke tengah kalau kursor pergi
      }}
      style={{ rotateX, rotateY, perspective: 1000 }}
      className="relative w-full transition-transform ease-out duration-200"
    >
      {children}
    </motion.div>
  );
}