"use client";

import Image from "next/image";
import logo from "@/app/assets/logo.svg";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface CustomLoaderProps {
  className?: string;
  variant?: "fullscreen" | "inline" | "spinner";
  label?: string;
  size?: number;
}

const CircuitPattern = () => {
  const lineColor = "#00A88D";

  // Koordinat Jalur Sirkuit
  const paths = [
    // --- KIRI ---
    "M 800 540 H 600 V 300 H 400 V 150 H 200",
    "M 600 540 V 750 H 400 V 900 H 200",
    "M 400 300 V 450 H 250",
    "M 400 750 V 600 H 250",

    // --- KANAN ---
    "M 1120 540 H 1320 V 250 H 1550 V 100 H 1700",
    "M 1320 540 V 800 H 1550 V 950 H 1700",
    "M 1550 250 V 400 H 1700",
    "M 1550 800 V 650 H 1700",

    // --- ATAS ---
    "M 960 450 V 300 H 750 V 100 H 600",
    "M 960 300 H 1170 V 100 H 1300",
    "M 750 100 V 50",
    "M 1170 100 V 50",

    // --- BAWAH ---
    "M 960 630 V 850 H 750 V 1000 H 600",
    "M 960 850 H 1170 V 1000 H 1300",
    "M 750 850 V 920",
    "M 1170 850 V 920",

    // --- KONEKTOR ---
    "M 600 300 V 200 H 750",
    "M 1320 250 V 200 H 1170",
    "M 600 750 V 850 H 750",
    "M 1320 800 V 850 H 1170",
  ];

  const rects = [
    // Nodes
    { x: 590, y: 530, w: 20, h: 20 },
    { x: 390, y: 290, w: 20, h: 20 },
    { x: 390, y: 740, w: 20, h: 20 },
    { x: 190, y: 140, w: 20, h: 20 },
    { x: 190, y: 890, w: 20, h: 20 },
    { x: 230, y: 440, w: 20, h: 20 },
    { x: 230, y: 590, w: 20, h: 20 },
    { x: 1310, y: 530, w: 20, h: 20 },
    { x: 1540, y: 240, w: 20, h: 20 },
    { x: 1540, y: 790, w: 20, h: 20 },
    { x: 1690, y: 90, w: 20, h: 20 },
    { x: 1690, y: 940, w: 20, h: 20 },
    { x: 1690, y: 390, w: 20, h: 20 },
    { x: 1690, y: 640, w: 20, h: 20 },
    { x: 950, y: 290, w: 20, h: 20 },
    { x: 740, y: 90, w: 20, h: 20 },
    { x: 1160, y: 90, w: 20, h: 20 },
    { x: 580, y: 90, w: 20, h: 20 },
    { x: 1290, y: 90, w: 20, h: 20 },
    { x: 950, y: 840, w: 20, h: 20 },
    { x: 740, y: 990, w: 20, h: 20 },
    { x: 1160, y: 990, w: 20, h: 20 },
    { x: 580, y: 990, w: 20, h: 20 },
    { x: 1290, y: 990, w: 20, h: 20 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 1. GARIS BAYANGAN (GHOST TRACK) - Selalu terlihat tipis */}
        {paths.map((d, i) => (
          <path
            key={`ghost-${i}`}
            d={d}
            stroke={lineColor}
            strokeWidth="1.5"
            strokeLinecap="square"
            opacity="0.2" // Transparan, terlihat dari awal
          />
        ))}

        {/* 2. GARIS UTAMA (ANIMASI DRAWING) - Mengisi garis bayangan */}
        {paths.map((d, i) => (
          <motion.path
            key={`anim-${i}`}
            d={d}
            stroke={lineColor} // Menggunakan atribut stroke, bukan className
            strokeWidth="1.5"
            strokeLinecap="square"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2, // Durasi mengisi garis (2 detik)
              ease: "easeInOut",
              delay: 0.1,
            }}
          />
        ))}

        {/* 3. NODE/KOTAK (ANIMASI MUNCUL) */}
        {rects.map((r, i) => (
          <motion.rect
            key={`rect-${i}`}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            stroke={lineColor}
            strokeWidth="1.5"
            fill="white"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              delay: 1.5 + i * 0.02, // Muncul setelah garis hampir selesai
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default function CustomLoader({
  className,
  variant = "spinner",
  label,
  size = 24,
}: CustomLoaderProps) {
  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
        <CircuitPattern />

        {/* Container Logo */}
        <div className="relative z-10 bg-white px-10 py-8 border-2 border-[#00A88D] rounded-sm shadow-xl">
          {/* Aksen Sudut */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#00A88D]" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#00A88D]" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#00A88D]" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#00A88D]" />

          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-3">
              <Image
                src={logo}
                alt="Logo"
                width={48}
                height={48}
                className="logo-dark-mode"
                priority
              />
              <span className="text-3xl font-bold tracking-[0.2em] text-[#00A88D] uppercase">
                FREEKANBAN
              </span>
            </div>

            {/* Loading Bar (Looping) */}
            <div className="w-full h-1 bg-gray-100 overflow-hidden mt-2">
              <motion.div
                className="h-full bg-[#00A88D]"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </div>

        {label && (
          <p className="absolute bottom-20 text-sm font-bold text-[#00A88D] tracking-widest uppercase animate-pulse">
            {label}
          </p>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 py-4",
          className
        )}
      >
        <div className="relative flex items-center justify-center w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Image
            src={logo}
            alt="Loading"
            width={20}
            height={20}
            className="logo-dark-mode opacity-80"
          />
        </div>
        {label && (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}
      </div>
    );
  }

  return (
    <Loader2
      className={cn("animate-spin text-current", className)}
      width={size}
      height={size}
    />
  );
}
