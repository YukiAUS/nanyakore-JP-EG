import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { text, context } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            detectedLanguage: { type: SchemaType.STRING },
            mainTranslation: { type: SchemaType.STRING },
            explanation: { type: SchemaType.STRING },
            alternatives: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  label: { type: SchemaType.STRING },
                  text: { type: SchemaType.STRING },
                },
                required: ['label', 'text'],
              },
            },
            example: { type: SchemaType.STRING },
          },
          required: ['detectedLanguage', 'mainTranslation', 'explanation', 'alternatives', 'example'],
        },
      },
    });

    const systemPrompt = `
あなたは高性能AI翻訳エンジン「Nani!?」です。
入力テキストを自動判定し、日本語なら英語へ、英語・その他なら自然な日本語へ翻訳してください。

要件:
1. 追加コンテキスト（指示）がある場合はそれに最優先に従ってください（例: 「@カジュアルに」「@ビジネスメールで」など）。
2. 指定されたJSON形式に従って結果を返してください。`;

    const userPrompt = `【翻訳対象】:\n${text}\n\n【追加指示 (Context)】:\n${context || 'なし'}`;

    const response = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const resultText = response.response.text();
    const result = JSON.parse(resultText || '{}');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Translate API Error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
