import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text, context } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const systemPrompt = `
あなたは高性能AI翻訳エンジン「Nani!?」です。
入力テキストを自動判定し、日本語なら英語へ、英語・その他なら自然な日本語へ翻訳してください。

要件:
1. 追加コンテキスト（指示）がある場合はそれに最優先に従ってください（例: 「@カジュアルに」「@ビジネスメールで」など）。
2. 指定されたJSONスキーマに従って結果を返してください。`;

    const userPrompt = `【翻訳対象】:\n${text}\n\n【追加指示 (Context)】:\n${context || 'なし'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: { type: Type.STRING },
            mainTranslation: { type: Type.STRING },
            explanation: { type: Type.STRING },
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ['label', 'text'],
              },
            },
            example: { type: Type.STRING },
          },
          required: ['detectedLanguage', 'mainTranslation', 'explanation', 'alternatives', 'example'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Translate API Error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
