'use client';

import './globals.css';
import { useState } from 'react';
import { Sparkles, Copy, ArrowRightLeft, Check, SlidersHorizontal, Languages, Zap, RefreshCw } from 'lucide-react';

interface TranslationResult {
  detectedLanguage: string;
  mainTranslation: string;
  explanation: string;
  alternatives: { label: string; text: string }[];
  example: string;
}

const PRESET_CONTEXTS = [
  'ビジネスメール風',
  'フランクな日常会話',
  'ネイティブっぽいスラング',
  '丁寧な接客言葉',
];

export default function NaniMobilePage() {
  const [inputText, setInputText] = useState('');
  const [contextPrompt, setContextPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showContextInput, setShowContextInput] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, context: contextPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Translation failed');
      setResult(data);
    } catch (e) {
      alert('翻訳に失敗しました。Vercelの環境変数 GEMINI_API_KEY が正しく設定されているか確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 antialiased selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* 背景のグラデーションオーラ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* ヘッダー */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-5 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-lg">
              ✨
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-slate-100 text-lg leading-tight tracking-tight flex items-center gap-2">
              Nani!? Pocket
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">AI Nuance Translator</p>
          </div>
        </div>
        <button
          onClick={() => setShowContextInput(!showContextInput)}
          className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold ${
            showContextInput || contextPrompt
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">ニュアンス指定</span>
        </button>
      </header>

      {/* メインコンテンツ */}
      <main className="p-4 max-w-lg mx-auto space-y-5">
        {/* Context Option Block */}
        {showContextInput && (
          <div className="bg-slate-900/90 border border-indigo-500/40 rounded-3xl p-4 shadow-xl backdrop-blur-md space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <label className="text-xs text-indigo-300 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                スタイル・コンテキスト指示
              </label>
              {contextPrompt && (
                <button
                  onClick={() => setContextPrompt('')}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                >
                  リセット
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="例: ビジネスメール風に、フランクな大阪弁で..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
              value={contextPrompt}
              onChange={(e) => setContextPrompt(e.target.value)}
            />
            {/* プリセットタグ */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_CONTEXTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setContextPrompt(preset)}
                  className={`text-[11px] font-medium px-3 py-1 rounded-full border transition-all ${
                    contextPrompt === preset
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                      : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 入力エリア */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 shadow-2xl backdrop-blur-md space-y-3 focus-within:border-indigo-500/50 transition-all duration-300 group">
          <textarea
            className="w-full h-36 bg-transparent text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
            placeholder="原文を入力してください（日本語・英語・その他言語に対応）..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="flex justify-between items-center pt-3 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500 font-medium">
              {inputText.length} 文字
            </span>
            <button
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
              className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 disabled:opacity-40 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-600/25 transition-all duration-200"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                  <span className="text-sm font-semibold">ニュアンス解析中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-sm font-bold">AI 翻訳</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 翻訳結果表示カード */}
        {result && (
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 space-y-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
            {/* カードヘッダー */}
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-800/50 px-3 py-1 rounded-full shadow-sm">
                  {result.detectedLanguage || '検出言語'}
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.mainTranslation);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'コピー完了' : 'コピー'}</span>
              </button>
            </div>

            {/* 翻訳メイン結果 */}
            <div className="space-y-1">
              <p className="text-2xl font-black text-slate-100 leading-snug tracking-tight">
                {result.mainTranslation}
              </p>
            </div>

            {/* ニュアンス解説 */}
            {result.explanation && (
              <div className="bg-indigo-950/40 border border-indigo-900/60 rounded-2xl p-4 text-xs text-indigo-200/90 leading-relaxed shadow-inner space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-xs">
                  <span>💡</span>
                  <span>ニュアンス・背景解説</span>
                </div>
                <p className="pl-5 text-slate-300">{result.explanation}</p>
              </div>
            )}

            {/* 言い換えバリエーション */}
            {result.alternatives?.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">他の言い換え表現</span>
                <div className="grid gap-2">
                  {result.alternatives.map((alt, i) => (
                    <div key={i} className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex items-start gap-3 hover:border-slate-700 transition">
                      <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950 border border-indigo-800/60 px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                        {alt.label}
                      </span>
                      <span className="text-xs text-slate-200 font-medium leading-relaxed">{alt.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
