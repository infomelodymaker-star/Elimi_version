import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  buildEnhancedSystemInstruction,
  fetchLiveFirestoreSnapshot,
} from '@/lib/ai-knowledge-base';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'A valid message prompt is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return NextResponse.json({
        text: `⚠️ **GEMINI API Key Required**\n\nMonica is powered by Google's Gemini Flash model family (\`gemini-3.7-flash\`). To enable full conversational AI reasoning and real-time Firestore database analysis, please add your **GEMINI_API_KEY** in the **AI Studio Settings / Secrets** panel.`,
        source: 'missing-key',
      });
    }

    // Step 1: Query live Firestore collections in real-time (products, cars, houses)
    const liveDbData = await fetchLiveFirestoreSnapshot();

    // Step 2: Build dynamic system instructions containing company knowledge & live inventory
    const systemInstruction = buildEnhancedSystemInstruction(liveDbData);

    // Step 3: Initialize GoogleGenAI SDK
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Step 4: Construct multi-turn contents
    const contents: any[] = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-10)) {
        if (item.sender === 'user' && item.text) {
          contents.push({
            role: 'user',
            parts: [{ text: item.text }],
          });
        } else if (item.sender === 'ai' && item.text) {
          contents.push({
            role: 'model',
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Append the user's latest full prompt
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    // Step 5: Call Gemini Flash model via official SDK with retry & multi-model fallback
    const modelsToTry = [
      'gemini-3.7-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-2.5-flash',
    ];
    let generatedReply: string | null = null;
    let lastError: any = null;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const modelName of modelsToTry) {
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
              topP: 0.95,
            },
          });

          if (response.text && response.text.trim().length > 0) {
            generatedReply = response.text.trim();
            break;
          }
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.code || 0;
          const messageStr = String(err?.message || '');
          const isTransient =
            status === 503 ||
            status === 429 ||
            messageStr.includes('503') ||
            messageStr.includes('429') ||
            messageStr.includes('high demand') ||
            messageStr.includes('UNAVAILABLE') ||
            messageStr.includes('RESOURCE_EXHAUSTED');

          if (isTransient && attempts < maxAttempts) {
            // Brief backoff before re-attempting or cascading
            await sleep(600 * attempts);
            continue;
          }
          // Move to next candidate model in flash family
          break;
        }
      }

      if (generatedReply) {
        break;
      }
    }

    if (!generatedReply) {
      const errMsg =
        lastError?.message ||
        'The Gemini model is currently experiencing high temporary demand.';
      return NextResponse.json({
        text: `The AI service experienced a temporary high-demand spike. Please try your question again in a moment.\n\n*(Details: ${errMsg})*`,
        source: 'error',
      });
    }

    return NextResponse.json({
      text: generatedReply,
      source: 'gemini-flash',
      dbStatus: liveDbData.source,
    });
  } catch (err: any) {
    console.error('Unhandled error in Gemini chat route:', err);
    return NextResponse.json(
      {
        text: `Error processing your request with Monica AI: ${err?.message || 'Server error'}. Please check your API key configuration.`,
        source: 'error',
      },
      { status: 500 }
    );
  }
}
