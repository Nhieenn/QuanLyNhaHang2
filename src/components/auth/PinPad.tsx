"use client";

import React, { useState } from "react";
import { X, Check, Delete } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinPadProps {
  title?: string;
  subtitle?: string;
  onSuccess: (pin: string) => void;
  onCancel?: () => void;
  error?: boolean;
}

export function PinPad({ title = "Enter Staff PIN", subtitle = "Please enter your 4-digit access code", onSuccess, onCancel, error }: PinPadProps) {
  const [pin, setPin] = useState("");

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleClear = () => setPin("");
  const handleBackspace = () => setPin(prev => prev.slice(0, -1));

  const handleConfirm = () => {
    if (pin.length === 4) {
      onSuccess(pin);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white/95 backdrop-blur-md rounded-[48px] p-10 shadow-2xl w-full max-w-[440px] animate-in zoom-in-95 duration-500">
      {onCancel && (
        <button 
          onClick={onCancel}
          className="absolute top-8 right-8 w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface hover:rotate-90 transition-all duration-300"
        >
          <X size={20} strokeWidth={3} />
        </button>
      )}

      {/* Header */}
      <div className="w-16 h-16 bg-primary-container text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Check size={32} strokeWidth={3} />
      </div>
      <h3 className="text-3xl font-black text-on-surface text-center mb-2 tracking-tight">{title}</h3>
      <p className="text-sm font-medium text-outline text-center mb-10">{subtitle}</p>

      {/* 4-Digit Display */}
      <div className="flex gap-4 mb-10">
        {[0, 1, 2, 3].map((idx) => (
          <div 
            key={idx}
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black transition-all duration-200 border-2",
              pin.length > idx 
                ? "bg-primary-container border-primary text-primary scale-105 shadow-md" 
                : "bg-surface-container-low border-surface-container-highest/20 text-on-surface/20",
              error && "border-brand-coral bg-brand-coral/10 text-brand-coral animate-shake"
            )}
          >
            {pin[idx] ? "•" : ""}
          </div>
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="h-16 bg-surface-container-low rounded-2xl font-black text-xl hover:bg-surface-container-high active:scale-95 transition-all text-on-surface hover:text-primary"
          >
            {num}
          </button>
        ))}
        
        <button
          onClick={handleClear}
          className="h-16 bg-surface-container-low text-brand-coral rounded-2xl flex items-center justify-center hover:bg-brand-coral/10 transition-all font-black text-xs uppercase tracking-widest"
        >
          Clear
        </button>
        
        <button
          onClick={() => handleKeyPress("0")}
          className="h-16 bg-surface-container-low rounded-2xl font-black text-xl hover:bg-surface-container-high active:scale-95 transition-all text-on-surface hover:text-primary"
        >
          0
        </button>
        
        <button
          onClick={handleConfirm}
          disabled={pin.length < 4}
          className={cn(
            "h-16 rounded-2xl flex items-center justify-center transition-all font-black text-xs uppercase tracking-widest",
            pin.length === 4 
              ? "bg-[#006a67] text-white shadow-lg shadow-teal-900/20 active:scale-95" 
              : "bg-surface-container-low text-outline/30 cursor-not-allowed"
          )}
        >
          OK
        </button>
      </div>

      <button className="mt-8 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
        Forgot Staff PIN?
      </button>
    </div>
  );
}
