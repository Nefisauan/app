import { NextRequest, NextResponse } from "next/server";
import { interpretMessage } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, senderName } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const interpretation = await interpretMessage(message, senderName);

    return NextResponse.json(interpretation);
  } catch (error) {
    console.error("Interpretation error:", error);
    return NextResponse.json(
      { error: "Failed to interpret message" },
      { status: 500 }
    );
  }
}
