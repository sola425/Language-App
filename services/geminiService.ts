
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TriviaQuestion } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const triviaSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "The question in English about a French word or phrase."
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array of 4 possible answers in French."
      },
      correctAnswer: {
        type: Type.STRING,
        description: "The correct French answer from the options array."
      },
    },
    required: ["question", "options", "correctAnswer"],
  },
};

export async function generateTrivia(topic: string): Promise<TriviaQuestion[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 beginner-level multiple-choice trivia questions about basic French vocabulary related to ${topic}. The user is an English speaker.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: triviaSchema,
      },
    });
    
    const jsonText = response.text.trim();
    const triviaData = JSON.parse(jsonText);
    return triviaData as TriviaQuestion[];
  } catch (error) {
    console.error("Error generating trivia:", error);
    throw new Error("Failed to generate trivia questions. Please try again.");
  }
}

export async function getFeynmanExplanation(concept: string, userExplanation: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are Chloé, a friendly and encouraging French tutor. A student is trying to explain the concept of "${concept}" in their own words to test their understanding (Feynman Technique). Here is their explanation: "${userExplanation}". Gently correct any mistakes, praise their effort, and simplify the concept even further for them. Respond in a short, encouraging paragraph.`,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting Feynman explanation:", error);
        throw new Error("Chloé is busy right now. Please try again in a moment.");
    }
}

export async function getPronunciationAudio(text: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A clear voice
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return base64Audio;
        } else {
            throw new Error("No audio data received from API.");
        }
    } catch (error) {
        console.error("Error getting pronunciation audio:", error);
        throw new Error("Failed to generate audio. Please try again.");
    }
}

// Helper functions for audio decoding
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
  
export async function decodeAndPlayAudio(base64: string, ctx: AudioContext) {
    const decodedData = decode(base64);
    const dataInt16 = new Int16Array(decodedData.buffer);
    const frameCount = dataInt16.length / 1; // Mono channel
    const buffer = ctx.createBuffer(1, frameCount, 24000); // 24kHz sample rate
  
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
}
