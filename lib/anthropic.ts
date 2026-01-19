import { GoogleGenerativeAI } from '@google/generative-ai';

export interface InterpretationResult {
  interpretedMessage: string;
  emotionSummary: string;
  communicationTip: string;
}

export async function interpretMessage(
  originalMessage: string,
  senderName: string = "Your partner"
): Promise<InterpretationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return {
      interpretedMessage: originalMessage,
      emotionSummary: "AI service not configured. Please add GEMINI_API_KEY.",
      communicationTip: "Listen with an open heart."
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a compassionate couples therapist helping partners communicate better.

${senderName} sent this message to their partner:
"${originalMessage}"

Your task is to:
1. Rewrite the message in a softer, more constructive way that preserves the core meaning but removes any harsh tone, blame, or passive-aggressiveness. Make it feel like the person is expressing their feelings vulnerably rather than attacking.

2. Identify the underlying emotions the sender might be feeling (beyond what's explicitly stated).

3. Provide a brief tip for the receiver on how to respond with empathy.

Respond in this exact JSON format only, no other text:
{
  "interpretedMessage": "The softer version of the message",
  "emotionSummary": "2-3 sentences about what emotions are present",
  "communicationTip": "One brief tip for the receiver"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini raw response:', text);

    // Clean up the response - remove markdown code blocks if present
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(cleanedText) as InterpretationResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Gemini API error:', errorMessage);
    return {
      interpretedMessage: originalMessage,
      emotionSummary: `Error: ${errorMessage}`,
      communicationTip: "Listen with an open heart."
    };
  }
}
