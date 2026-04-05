import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FeedbackEntry {
  id: string;
  source: string;
  author: string;
  rating: number;
  time: string;
  timestamp: number;
  comment?: string;
}

interface FeedbackState {
  feedbacks: FeedbackEntry[];
  addFeedback: (feedback: Omit<FeedbackEntry, 'id' | 'timestamp' | 'time'>) => void;
  getAverageRating: () => number;
  getRecentFeedbacks: (limit?: number) => FeedbackEntry[];
}

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set, get) => ({
      feedbacks: [
        { id: "f1", source: "Bàn 12", author: "Khách hàng", rating: 4, timestamp: Date.now() - 600000, time: "10 phút trước" },
        { id: "f2", source: "Bàn 4", author: "Khách hàng", rating: 5, timestamp: Date.now() - 1500000, time: "25 phút trước" },
        { id: "f3", source: "Mang về 102", author: "Khách hàng", rating: 5, timestamp: Date.now() - 2400000, time: "40 phút trước" },
        { id: "f4", source: "Bàn 18", author: "Khách hàng", rating: 3, timestamp: Date.now() - 3600000, time: "1 giờ trước" }
      ],
      addFeedback: (feedback) => {
        const newEntry: FeedbackEntry = {
          ...feedback,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          time: "vừa xong"
        };
        set((state) => ({
          feedbacks: [newEntry, ...state.feedbacks]
        }));
      },
      getAverageRating: () => {
        const { feedbacks } = get();
        if (feedbacks.length === 0) return 0;
        const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
        return parseFloat((sum / feedbacks.length).toFixed(1));
      },
      getRecentFeedbacks: (limit = 4) => {
        return get().feedbacks.slice(0, limit);
      }
    }),
    {
      name: 'elevated-pos-feedback',
    }
  )
);
