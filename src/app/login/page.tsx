"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Delete, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleClear = () => setPin("");
  const handleBackspace = () => setPin(prev => prev.slice(0, -1));

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === "123456") {
        // Success
        router.push("/table-map");
      } else {
        // Failure
        setError(true);
        setTimeout(() => setPin(""), 500);
      }
    }
  }, [pin, router]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8">
      {/* Logo & Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-display font-bold text-on-surface mb-2">
          Elevated <span className="text-primary">POS</span>
        </h1>
        <p className="text-on-surface/50 font-sans">Please enter your staff PIN to continue</p>
      </div>

      {/* PIN Display */}
      <div className="mb-12 flex gap-4">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-200",
              pin.length > i 
                ? "bg-primary border-primary scale-125" 
                : "border-surface-container-highest bg-transparent",
              error && "bg-error-container border-error-container animate-bounce"
            )}
          />
        ))}
      </div>

      {/* PIN Pad */}
      <div className="grid grid-cols-3 gap-6 max-w-sm w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="h-20 w-20 mx-auto rounded-full bg-surface-container-lowest shadow-ambient flex items-center justify-center text-2xl font-display font-bold text-on-surface hover:bg-primary-container hover:text-primary transition-all active:scale-95 touch-target"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="h-20 w-20 mx-auto rounded-full bg-surface-container-highest/50 flex items-center justify-center text-sm font-sans font-bold text-on-surface hover:bg-error-container hover:text-white transition-all active:scale-95 touch-target"
        >
          CLEAR
        </button>
        <button
          onClick={() => handleKeyPress("0")}
          className="h-20 w-20 mx-auto rounded-full bg-surface-container-lowest shadow-ambient flex items-center justify-center text-2xl font-display font-bold text-on-surface hover:bg-primary-container hover:text-primary transition-all active:scale-95 touch-target"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="h-20 w-20 mx-auto rounded-full bg-surface-container-highest/50 flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-all active:scale-95 touch-target"
        >
          <Delete size={24} />
        </button>
      </div>

      {/* Selected Staff */}
      <div className="mt-16 flex items-center gap-4 bg-surface-container-low px-6 py-3 rounded-2xl shadow-sm border border-surface-container-highest/30">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-display font-bold text-primary text-sm">
          AX
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-on-surface">Alex (Manager)</span>
          <span className="text-xs text-on-surface/50">Current Session</span>
        </div>
        <button className="ml-4 p-2 text-on-surface/30 hover:text-on-surface transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
