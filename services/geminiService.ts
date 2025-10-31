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
        // The TTS model works best with just the text to be spoken.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
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
            console.error("Audio generation response did not contain audio data.", JSON.stringify(response));
            throw new Error("No audio data received from API.");
        }
    } catch (error) {
        console.error("Error getting pronunciation audio:", error);
        throw new Error("Failed to generate audio. Please try again.");
    }
}

async function blobToBase64(blob: Blob): Promise<string> {
    const reader = new FileReader();
    await new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
    return (reader.result as string).split(',')[1];
}

export async function getPronunciationFeedback(
    aiInstance: GoogleGenAI,
    targetPhrase: string,
    audioBlob: Blob
): Promise<{ score: number; feedback: string }> {
    try {
        const base64Audio = await blobToBase64(audioBlob);

        const audioPart = {
            inlineData: {
                mimeType: audioBlob.type,
                data: base64Audio,
            },
        };

        const prompt = `You are a friendly, expert French pronunciation coach. The user is attempting to say a specific target phrase.

Target Phrase: "${targetPhrase}"

Listen to the user's attached audio recording and provide:
1.  A "Correctness" score from 0 to 100.
2.  A one or two-sentence feedback report, focusing *only* on the most important error (or praising their accuracy). Be specific (e.g., "Your 'r' sound in 'voudrais' was perfect!" or "Great job! Try to link the words 'un' and 'café' more smoothly.").

Format your response as:
[SCORE]: 85
[FEEDBACK]: Your pronunciation of 'Bonjour' was excellent, but the 'oi' sound in 'croissant' was a bit off. Try to make it sound more like 'wa'.`;

        const textPart = { text: prompt };

        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [textPart, audioPart] },
        });

        const responseText = response.text;

        const scoreMatch = responseText.match(/\[SCORE\]:\s*(\d+)/);
        const feedbackMatch = responseText.match(/\[FEEDBACK\]:\s*(.*)/s);

        if (!scoreMatch || !feedbackMatch) {
            console.error("Could not parse feedback from response:", responseText);
            throw new Error("Could not parse feedback from Chloé.");
        }

        return {
            score: parseInt(scoreMatch[1], 10),
            feedback: feedbackMatch[1].trim(),
        };

    } catch (error) {
        console.error("Error getting pronunciation feedback:", error);
        throw new Error("Chloé is busy listening to someone else right now. Please try again.");
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