// contexts/sidebarContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isRightSidebarVisible: boolean;
  toggleRightSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration and localStorage safely
  useEffect(() => {
    setIsMounted(true);

    // Only access localStorage after component mounts
    const saved = window.localStorage?.getItem("rightSidebarVisible");
    if (saved !== null) {
      try {
        setIsRightSidebarVisible(JSON.parse(saved));
      } catch (error) {
        console.warn(
          "Failed to parse sidebar visibility from localStorage:",
          error
        );
        // Fallback to default value
        setIsRightSidebarVisible(true);
      }
    }
  }, []);

  const toggleRightSidebar = () => {
    setIsRightSidebarVisible((prev) => {
      const newState = !prev;

      // Only save to localStorage if it's available
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          window.localStorage.setItem(
            "rightSidebarVisible",
            JSON.stringify(newState)
          );
        } catch (error) {
          console.warn(
            "Failed to save sidebar visibility to localStorage:",
            error
          );
        }
      }

      return newState;
    });
  };

  // During SSR or before hydration, render with default values
  if (!isMounted) {
    return (
      <SidebarContext.Provider
        value={{
          isRightSidebarVisible: true, // Default value during SSR
          toggleRightSidebar: () => {}, // No-op during SSR
        }}
      >
        {children}
      </SidebarContext.Provider>
    );
  }

  return (
    <SidebarContext.Provider
      value={{
        isRightSidebarVisible,
        toggleRightSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
