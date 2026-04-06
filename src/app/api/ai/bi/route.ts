import { NextResponse } from "next/server";
import { analyzeBusinessData } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { sales, inventory } = await req.json();

    if (!sales || !inventory) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu doanh thu hoặc tồn kho để phân tích." },
        { status: 400 }
      );
    }

    const analysis = await analyzeBusinessData(sales, inventory);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("BI API Error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi thực hiện phân tích BI." },
      { status: 500 }
    );
  }
}
