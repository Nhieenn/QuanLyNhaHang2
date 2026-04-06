const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyDnYZksMysBo1d952sFbNiOIwHhphHcyBw";
const genAI = new GoogleGenerativeAI(API_KEY);

async function listVisibleModels() {
  try {
    // Lưu ý: SDK JS hiện tại không có phương thức listModels trực tiếp trên instance genAI
    // Chúng ta sẽ thử gọi các model phổ biến nhất để xem cái nào phản hồi
    const models = ["gemini-pro", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.5-flash-latest"];
    
    console.log("--- Testing Models Availability ---");
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        // Thử tạo một nội dung cực ngắn để test
        await model.generateContent("hi");
        console.log(`✅ [SUCCESS] Model "${m}" is available.`);
      } catch (err) {
        console.log(`❌ [FAILED] Model "${m}": ${err.message}`);
      }
    }
  } catch (error) {
    console.log("Error listing models:", error.message);
  }
}

listVisibleModels();
