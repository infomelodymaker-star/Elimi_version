import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  analyzeUserIntent,
  fetchTargetedFirestoreData,
  buildTargetedSystemInstruction,
} from '@/lib/ai-knowledge-base';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { sanitizeString } from '@/lib/security-validation';

export const dynamic = 'force-dynamic';

// Valid Flash models ordered for fallback on quota exhaustion or temporary unavailability
const GEMINI_MODELS_CASCADE = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
];

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: Max 25 chat requests per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`gemini-chat-${clientIp}`, 25, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          text: 'Muraho! Vous envoyez des messages trop rapidement. Veuillez patienter un instant avant de continuer.',
          source: 'rate-limited',
        },
        {
          status: 429,
          headers: { 'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString() },
        }
      );
    }

    const { message, history } = await req.json();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'A valid message prompt is required.' },
        { status: 400 }
      );
    }

    // Limit message size to prevent prompt injection and token stuffing
    const cleanMessage = sanitizeString(message, 1500);

    // Step 1: Analyze user message & conversation intent to determine which collections to consult
    const intents = analyzeUserIntent(cleanMessage, history);

    // Step 2: Dynamically query ONLY relevant Firestore collections + live database settings
    const targetedDbData = await fetchTargetedFirestoreData(intents);

    // Step 3: Extract live WhatsApp / Phone / Email directly from database settings
    const settings = targetedDbData.settings;
    const rawWhatsApp = (settings.whatsappNumber || '25769992984').replace(/[^0-9]/g, '');
    const rawPhone = settings.contactPhone || settings.phoneNumber || '+257 69 99 29 84';

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return NextResponse.json({
        text: `Muraho! 👋 I am Monica from ELIMI. Our AI service is currently in standby mode, but our team is available 24/7 on [WhatsApp Concierge (${rawPhone})](https://wa.me/${rawWhatsApp}) for all VIP Protocol, Allocations & Rents, Luxury Fleet, Shop, Digital Solutions, and Print orders.`,
        source: 'missing-key',
      });
    }

    // Step 4: Build token-optimized targeted system prompt containing only relevant queried domains
    const systemInstruction = buildTargetedSystemInstruction(targetedDbData);

    // Step 5: Initialize GoogleGenAI SDK
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Step 6: Construct multi-turn contents (optimized history to conserve tokens)
    const contents: any[] = [];

    if (Array.isArray(history) && history.length > 0) {
      // Keep only the most recent 6 messages to minimize token usage
      for (const item of history.slice(-6)) {
        if (item.sender === 'user' && item.text) {
          contents.push({
            role: 'user',
            parts: [{ text: sanitizeString(item.text, 500) }],
          });
        } else if (item.sender === 'ai' && item.text) {
          contents.push({
            role: 'model',
            parts: [{ text: String(item.text).slice(0, 700) }],
          });
        }
      }
    }

    // Append the user's latest prompt
    contents.push({
      role: 'user',
      parts: [{ text: cleanMessage }],
    });

    let generatedReply: string | null = null;
    let successfulModel: string | null = null;

    // Step 7: Multi-model automatic fallback on quota exhaustion / availability
    for (const modelName of GEMINI_MODELS_CASCADE) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.6,
            topP: 0.95,
          },
        });

        if (response.text && response.text.trim().length > 0) {
          generatedReply = response.text.trim();
          successfulModel = modelName;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} attempt failed (trying next fallback):`, err?.message || err);
        continue;
      }
    }

    if (!generatedReply) {
      // Graceful fallback response when quota is exceeded across all models
      return NextResponse.json({
        text: `Muraho! 👋 I am Monica from ELIMI. We are currently experiencing high inquiry volume. For immediate assistance with Protocol Staffing, Allocations & Rents, Luxury Car Fleet, Shop orders, Digital Solutions, or Custom Printing in Burundi, please contact our direct [WhatsApp Concierge (${rawPhone})](https://wa.me/${rawWhatsApp}) or explore our [Protocol Hub](/protocol), [Allocations & Rents](/allocations), [Luxury Fleet](/cars), [Digital Solutions](/digital-solutions), [Elimi Shop](/shop), and [Print Solutions](/print).`,
        source: 'fallback-quota',
        dbStatus: targetedDbData.source,
      });
    }

    return NextResponse.json({
      text: generatedReply,
      source: successfulModel || 'gemini-flash',
      dbStatus: targetedDbData.source,
    });
  } catch (err: any) {
    console.error('Unhandled error in Gemini chat route:', err);
    return NextResponse.json(
      {
        text: `Muraho! I am Monica from ELIMI. Please connect directly with our 24/7 team via [WhatsApp Concierge](https://wa.me/25769992984) for instant booking and inquiries.`,
        source: 'error',
      },
      { status: 200 }
    );
  }
}
