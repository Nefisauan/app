import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface InterpretationResult {
  interpretedMessage: string;
  emotionSummary: string;
  communicationTip: string;
}

export async function interpretMessage(
  originalMessage: string,
  senderName: string = "Your partner"
): Promise<InterpretationResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a compassionate couples therapist helping partners communicate better.

${senderName} sent this message to their partner:
"${originalMessage}"

Your task is to:
1. Rewrite the message in a softer, more constructive way that preserves the core meaning but removes any harsh tone, blame, or passive-aggressiveness. Make it feel like the person is expressing their feelings vulnerably rather than attacking.

2. Identify the underlying emotions the sender might be feeling (beyond what's explicitly stated).

3. Provide a brief tip for the receiver on how to respond with empathy.

Respond in this exact JSON format:
{
  "interpretedMessage": "The softer version of the message",
  "emotionSummary": "2-3 sentences about what emotions are present",
  "communicationTip": "One brief tip for the receiver"
}

Only respond with the JSON, no other text.`
      }
    ]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  try {
    return JSON.parse(content.text) as InterpretationResult;
  } catch {
    // Fallback if JSON parsing fails
    return {
      interpretedMessage: originalMessage,
      emotionSummary: "Unable to analyze emotions at this time.",
      communicationTip: "Listen with an open heart."
    };
  }
}
