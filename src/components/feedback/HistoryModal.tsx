"use client";

import React, { useState } from "react";
import { X, Star, Filter, MessageSquare, Clock, Smile, Frown, Meh, Annoyed, Laugh, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFeedbackStore, FeedbackEntry } from "@/store/feedbackStore";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { feedbacks } = useFeedbackStore();
  const { language } = useSettingsStore();
  const t = translations[language].feedbackPage;
  
  const [filter, setFilter] = useState<number | "all">("all");

  if (!isOpen) return null;

  const filteredFeedbacks = filter === "all" 
    ? feedbacks 
    : feedbacks.filter(f => f.rating === filter);

  const getRatingIcon = (rating: number) => {
    switch (rating) {
      case 1: return <Frown size={24} className="text-brand-coral" />;
      case 2: return <Annoyed size={24} className="text-brand-orange" />;
      case 3: return <Meh size={24} className="text-brand-gold" />;
      case 4: return <Smile size={24} className="text-brand-teal" />;
      case 5: return <Laugh size={24} className="text-brand-teal" />;
      default: return <Circle size={24} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-[48px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-10 pb-6 border-b border-surface-container flex items-center justify-between bg-surface-container-lowest">
          <div>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">{t.recentRatings}</h2>
            <p className="text-sm text-outline font-bold mt-1">Tổng cộng {feedbacks.length} ý kiến khách hàng</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-surface-container-low rounded-full transition-all text-outline">
            <X size={28} />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="px-10 py-6 border-b border-surface-container flex gap-3 overflow-x-auto scrollbar-none">
          <FilterButton 
            active={filter === "all"} 
            onClick={() => setFilter("all")}
            label="Tất cả"
            count={feedbacks.length}
          />
          {[5, 4, 3, 2, 1].map(stars => (
            <FilterButton 
              key={stars}
              active={filter === stars}
              onClick={() => setFilter(stars)}
              label={`${stars} ★`}
              count={feedbacks.filter(f => f.rating === stars).length}
            />
          ))}
        </div>

        {/* Feedbacks List */}
        <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-surface-container-lowest/30">
          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((entry) => (
              <div key={entry.id} className="bg-white rounded-3xl p-8 border border-surface-container-low shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center">
                      {getRatingIcon(entry.rating)}
                    </div>
                    <div>
                      <h4 className="font-black text-on-surface">{entry.source} - {entry.author}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-outline">
                        <Clock size={12} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{entry.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={16} 
                        className={cn(
                          "transition-colors", 
                          s <= entry.rating ? "text-brand-gold fill-brand-gold" : "text-surface-container-highest"
                        )} 
                        strokeWidth={2.5}
                      />
                    ))}
                  </div>
                </div>
                {entry.comment && (
                  <div className="mt-4 p-4 bg-surface-container-low rounded-2xl border border-surface-container-high/50 italic text-outline font-medium text-sm">
                    "{entry.comment}"
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-30 text-center">
               <MessageSquare size={64} className="mb-4" />
               <p className="font-black text-lg uppercase tracking-widest">Không có đánh giá {filter} sao nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count: number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all border-2",
        active 
          ? "bg-[#006a67] border-[#006a67] text-white shadow-lg scale-105" 
          : "bg-white border-surface-container-high hover:border-brand-teal/50 text-outline"
      )}
    >
      {label}
      <span className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors",
        active ? "bg-white/20 text-white" : "bg-surface-container text-outline"
      )}>
        {count}
      </span>
    </button>
  );
}
