'use client';

import './globals.css';
import { useState } from 'react';
import { Copy, ArrowRightLeft, Check, SlidersHorizontal } from 'lucide-react';

interface TranslationResult {
  detectedLanguage: string;
  mainTranslation: string;
  explanation: string;
  alternatives: { label: string; text: string }[];
  example: string;
}

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
      setResult(data);
    } catch (e) {
      alert('翻訳に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 antialiased">
      <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-slate-900 flex items-center justify-center font-bold text-slate-900 text-xs">
            🐰
          </div>
          <span className="font-bold text-slate-100 text-lg">Nani!? Pocket</span>
        </div>
        <button
          onClick={() => setShowContextInput(!showContextInput)}
          className={`p-2 rounded-full border transition ${showContextInput ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        {showContextInput && (
          <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-3">
            <label className="text-xs text-indigo-400 font-semibold block mb-1">@ コンテキスト・指示</label>
            <input
              type="text"
              placeholder="例: フランクな関西弁で、ビジネスメールで"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              value={contextPrompt}
              onChange={(e) => setContextPrompt(e.target.value)}
            />
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
          <textarea
            className="w-full h-32 bg-transparent text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
            placeholder="翻訳する文章を入力..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="flex justify-end items-center pt-2 border-t border-slate-800/60">
            <button
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-40 text-white font-bold px-6 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
            >
              {loading ? (
                <span className="text-sm">解析中...</span>
              ) : (
                <>
                  <span className="text-sm">翻訳</span>
                  <ArrowRightLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-950 border border-indigo-900/60 px-2.5 py-1 rounded-full">
                {result.detectedLanguage}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.mainTranslation);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '完了' : 'コピー'}</span>
              </button>
            </div>

            <p className="text-xl font-bold text-slate-100 leading-snug">
              {result.mainTranslation}
            </p>

            {result.explanation && (
              <div className="bg-indigo-950/30 border border-indigo-900/40 rounded-2xl p-3.5 text-xs text-indigo-200/90 leading-relaxed">
                <span className="font-bold block mb-1 text-indigo-300">💡 ニュアンス解説</span>
                {result.explanation}
              </div>
            )}

            {result.alternatives?.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">言い換え案</span>
                <div className="space-y-2">
                  {result.alternatives.map((alt, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded mr-2">
                        {alt.label}
                      </span>
                      <span className="text-xs text-slate-200">{alt.text}</span>
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
