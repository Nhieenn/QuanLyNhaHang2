import { GoogleGenerativeAI } from "@google/generative-ai";

// Lưu ý: API Key nên được cấu hình trong .env.local
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiResponse = async (prompt: string) => {
  if (!API_KEY) {
    return "Hệ thống AI chưa được cấu hình API Key. Vui lòng thêm NEXT_PUBLIC_GEMINI_API_KEY vào tệp .env.local.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    return `Có lỗi xảy ra khi kết nối với AI: ${error.message}`;
  }
};

/**
 * Hàm phân tích tình hình kinh doanh chuyên sâu cho POS
 */
export const analyzeBusinessData = async (salesData: any[], inventoryData: any[]) => {
  const prompt = `
    Bạn là một chuyên gia phân tích kinh doanh (Business Intelligence) cho một nhà hàng cao cấp.
    Dựa trên dữ liệu dưới đây, hãy đưa ra 3 nhận xét ngắn gọn, thực tế và có giá trị nhất cho chủ quán.
    
    Dữ liệu Doanh thu: ${JSON.stringify(salesData.slice(0, 10))}
    Dữ liệu Kho hàng: ${JSON.stringify(inventoryData)}
    
    Yêu cầu:
    1. Ngôn ngữ: Tiếng Việt.
    2. Tập trung vào: Món bán chạy, cảnh báo hết hàng, và gợi ý tăng doanh thu.
    3. Định dạng: Trả về danh sách gạch đầu dòng, không quá 50 từ mỗi ý.
  `;

  return getGeminiResponse(prompt);
};
