
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getTutorResponse } from '../services/geminiService';
import { GoogleGenAI, Modality } from "@google/genai";

const ChatTutor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Konnichiwa! Sou o Japostar Sensei. Como posso te ajudar hoje? Posso tirar dúvidas de gramática ou praticarmos vocabulário! ⭐', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await getTutorResponse(input, history);
      const aiMsg: ChatMessage = { 
        role: 'model', 
        text: response || 'Desculpe, tive um pequeno erro estelar. Pode repetir?', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = async (text: string, index: number) => {
    if (isPlaying !== null) return;
    setIsPlaying(index);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Leia isto com clareza em japonês e português: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore tem uma boa entonação para japonês
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decode = (base64: string) => {
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          return bytes;
        };
        const audioData = decode(base64Audio);
        const dataInt16 = new Int16Array(audioData.buffer);
        const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsPlaying(null);
        source.start();
      } else {
        setIsPlaying(null);
      }
    } catch (err) {
      console.error("TTS Error:", err);
      setIsPlaying(null);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-slate-800 p-5 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-2xl shadow-lg">✨</div>
          <div>
            <h3 className="font-bold text-lg">Japostar Sensei</h3>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Pronto para ajudar
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative max-w-[85%] px-5 py-4 rounded-3xl shadow-md ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-700 text-slate-100 rounded-tl-none border border-slate-600'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed mb-2">{msg.text}</p>
              
              <div className="flex items-center justify-between gap-4 mt-2">
                <p className="text-[10px] opacity-40">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {msg.role === 'model' && (
                  <button 
                    onClick={() => speakMessage(msg.text, idx)}
                    disabled={isPlaying !== null}
                    className={`p-2 rounded-full transition-all ${
                      isPlaying === idx ? 'bg-indigo-500 animate-pulse' : 'hover:bg-slate-600 text-indigo-400'
                    }`}
                    title="Ouvir pronúncia"
                  >
                    {isPlaying === idx ? '🔊' : '🔈'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 px-5 py-4 rounded-3xl rounded-tl-none border border-slate-600 animate-pulse text-slate-400 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></div>
              </div>
              Sensei está pensando...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-5 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-3 bg-slate-900 rounded-2xl p-2 border border-slate-700 focus-within:border-indigo-500 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mensagem em português ou japonês..."
            className="flex-1 bg-transparent px-4 py-2 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-90"
          >
            ➔
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTutor;
