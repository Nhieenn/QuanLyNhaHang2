"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Star, 
  ChevronRight, 
  MessageSquare, 
  Users, 
  Plus, 
  X,
  CheckCircle2,
  Smile,
  Frown,
  Meh,
  Annoyed,
  Laugh,
  Clock,
  ArrowUpRight,
  Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackEntry {
  id: string;
  source: string;
  author: string;
  rating: number;
  time: string;
  comment?: string;
}

const RECENT_FEEDBACK: FeedbackEntry[] = [
  { id: "f1", source: "Table 12", author: "Sarah J.", rating: 4, time: "10 minutes ago" },
  { id: "f2", source: "Table 4", author: "Mark W.", rating: 5, time: "25 minutes ago" },
  { id: "f3", source: "Takeaway 102", author: "Emily R.", rating: 5, time: "40 minutes ago" },
  { id: "f4", source: "Table 18", author: "Davit K.", rating: 3, time: "1 hour ago" }
];

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Tự động mở Modal nếu có tham số showRating=true từ trang Checkout chuyển sang
  React.useEffect(() => {
    if (searchParams.get("showRating") === "true") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const getRatingIcon = (rating: number, size: number = 32) => {
    switch (rating) {
      case 1: return <Frown size={size} />;
      case 2: return <Annoyed size={size} />;
      case 3: return <Meh size={size} />;
      case 4: return <Smile size={size} />;
      case 5: return <Laugh size={size} />;
      default: return <Circle size={size} strokeWidth={1.5} className="opacity-20" />;
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
      setSelectedStars(0);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto px-4 lg:px-10 pb-20 pt-10">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-on-surface tracking-tight leading-none mb-2">Feedback History</h2>
          <p className="text-sm font-bold text-outline tracking-tight">Reviewing recent guest submissions for today.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#006a67] text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-[#005a57] transition-all"
        >
          <Plus size={20} />
          New Feedback
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left: Recent Ratings */}
        <div className="flex-1 bg-white rounded-[40px] p-10 shadow-ambient border border-surface-container-low min-h-[500px]">
          <h3 className="text-xl font-black text-on-surface mb-8">Recent Ratings</h3>
          
          <div className="space-y-4">
            {RECENT_FEEDBACK.map((entry) => (
              <div key={entry.id} className="bg-surface-container-low/50 rounded-3xl p-6 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-surface-container">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-brand-teal/20 text-[#006a67] flex items-center justify-center shadow-sm">
                    {getRatingIcon(entry.rating, 32)}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-on-surface">{entry.source} - {entry.author}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-outline" />
                      <span className="text-xs font-bold text-outline">{entry.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={20} 
                      className={cn(
                        "transition-colors", 
                        s <= entry.rating ? "text-brand-gold fill-brand-gold" : "text-surface-container-highest"
                      )} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-10 py-5 rounded-2xl bg-surface-container-low text-outline font-black text-xs uppercase tracking-widest hover:text-on-surface transition-colors">
            View All History
          </button>
        </div>

        {/* Right: Stats */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          <div className="bg-white rounded-[40px] p-10 shadow-ambient border border-surface-container-low flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black text-outline uppercase tracking-[0.25em] mb-4">TODAY'S SCORE</span>
            <div className="text-8xl font-black text-[#006a67] tracking-tighter mb-2">4.8</div>
            <h4 className="text-xl font-black text-on-surface mb-2">Average Rating</h4>
            <div className="flex items-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-gold rounded-full font-bold text-xs">
              <ArrowUpRight size={14} />
              +0.2 from yesterday
            </div>
            <p className="text-xs text-outline font-bold mt-6">Based on 124 reviews today</p>
          </div>

          <div className="bg-white rounded-[40px] p-10 shadow-ambient border border-surface-container-low">
             <div className="flex items-center justify-between mb-8">
               <h4 className="text-lg font-black text-on-surface">Review Channels</h4>
               <Users size={20} className="text-outline" />
             </div>
             <div className="space-y-6">
                <ChannelStat label="Dine-in" value={88} percentage={72} />
                <ChannelStat label="Takeaway" value={36} percentage={28} />
             </div>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300 px-4">
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-[500px] bg-white rounded-[48px] p-12 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center">
            
            {isSubmitted ? (
               <div className="py-10 flex flex-col items-center animate-in fade-in duration-500">
                  <div className="w-24 h-24 bg-brand-teal rounded-full flex items-center justify-center text-[#006a67] shadow-xl mb-8">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-on-surface">Thank You!</h3>
                  <p className="text-outline mt-2 font-bold">Your feedback has been recorded.</p>
               </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-8 right-8 w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-all"
                >
                  <X size={24} />
                </button>

                <div className="w-20 h-20 bg-brand-teal/20 text-[#006a67] rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-300">
                  {getRatingIcon(hoverStars || selectedStars, 40)}
                </div>
                
                <h3 className="text-3xl font-black text-on-surface text-center mb-2">How was your experience?</h3>
                <p className="text-sm font-bold text-outline text-center mb-10">Your feedback helps us grow and serve you better.</p>
                
                {/* Star Interaction */}
                <div className="flex gap-4 mb-10">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      key={s}
                      onMouseEnter={() => setHoverStars(s)}
                      onMouseLeave={() => setHoverStars(0)}
                      onClick={() => setSelectedStars(s)}
                      className={cn(
                        "relative transition-all duration-300",
                        (hoverStars || selectedStars) >= s ? "scale-110" : "scale-100"
                      )}
                    >
                      <Star 
                        size={60} 
                        className={cn(
                          "transition-colors duration-300",
                          (hoverStars || selectedStars) >= s ? "text-brand-gold fill-brand-gold" : "text-surface-container-highest"
                        )} 
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>

                <div className="w-full space-y-4 mb-10">
                  <span className="text-[10px] font-black text-outline uppercase tracking-widest pl-2">SHARE YOUR THOUGHTS</span>
                  <textarea 
                    placeholder="Tell us more about your visit..."
                    className="w-full h-40 bg-surface-container-low rounded-[32px] p-6 text-on-surface font-sans text-sm focus:outline-none focus:ring-4 focus:ring-brand-teal/20 placeholder:text-outline/50 resize-none transition-all"
                  />
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={selectedStars === 0}
                  className={cn(
                    "w-full py-6 rounded-[24px] font-black text-lg transition-all shadow-lg active:scale-95",
                    selectedStars > 0 
                      ? "bg-[#006a67] text-white hover:bg-[#005a57]" 
                      : "bg-surface-container-highest text-white/50 cursor-not-allowed"
                  )}
                >
                  Submit Feedback
                </button>
                
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="mt-6 text-xs font-black text-outline hover:text-on-surface transition-colors p-2"
                >
                  Skip for now
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChannelStat({ label, value, percentage }: { label: string; value: number; percentage: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-base font-black text-on-surface">{label}</span>
        <span className="text-sm font-bold text-outline">{value} reviews</span>
      </div>
      <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden">
        <div 
          className="h-full bg-brand-teal transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
