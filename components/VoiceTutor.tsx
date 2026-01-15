
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const VoiceTutor: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const inputCtxRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopSession();
    };
  }, []);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const startSession = async () => {
    if (isOffline || sessionRef.current) return;
    setStatus('connecting');
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (!inputCtxRef.current) {
      inputCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }

    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    if (inputCtxRef.current.state === 'suspended') await inputCtxRef.current.resume();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            setIsActive(true);
            
            const source = inputCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputCtxRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
              if (status === 'speaking') return; // Opcional: ignorar input enquanto o robô fala

              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              
              sessionPromise.then(session => {
                if (session && sessionRef.current) { // Verifica se ainda está ativo
                  session.sendRealtimeInput({
                    media: {
                      data: encode(new Uint8Array(int16.buffer)),
                      mimeType: 'audio/pcm;rate=16000'
                    }
                  });
                }
              }).catch(() => {});
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtxRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + " " + message.serverContent.outputTranscription.text);
            }

            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data && audioContextRef.current) {
                  setStatus('speaking');
                  const ctx = audioContextRef.current;
                  nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                  const buffer = await decodeAudioData(decode(part.inlineData.data), ctx);
                  const source = ctx.createBufferSource();
                  source.buffer = buffer;
                  source.connect(ctx.destination);
                  source.onended = () => {
                    sourcesRef.current.delete(source);
                    if (sourcesRef.current.size === 0) setStatus('listening');
                  };
                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += buffer.duration;
                  sourcesRef.current.add(source);
                }
              }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Erro na Live API:", e);
            stopSession();
          },
          onclose: () => stopSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: "Você é o Japostar Sensei. Conversação ativa. Ouça o usuário e responda de forma encorajadora e curta. Dê uma palavra em japonês para ele repetir se houver silêncio.",
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    setIsActive(false);
    setStatus('idle');
    setTranscription('');
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="bg-slate-800/80 p-8 rounded-3xl border border-indigo-500/30 text-center space-y-6 relative overflow-hidden shadow-2xl">
      {isOffline && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6">
          <span className="text-4xl mb-4">📡🚫</span>
          <h3 className="text-xl font-bold">O Sensei está Offline</h3>
          <p className="text-slate-400 text-sm mt-2">O modo voz requer internet.</p>
        </div>
      )}

      <div className="relative inline-block">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl transition-all duration-500 ${
          status === 'listening' ? 'bg-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)] animate-pulse' :
          status === 'speaking' ? 'bg-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.6)]' :
          status === 'connecting' ? 'bg-yellow-500 animate-spin-slow' :
          'bg-slate-700 shadow-inner'
        }`}>
          {status === 'connecting' ? '⏳' : status === 'speaking' ? '🏮' : status === 'listening' ? '🎤' : '🎙️'}
        </div>
        {status === 'listening' && (
          <div className="absolute -inset-4 rounded-full border-4 border-green-400/20 animate-ping"></div>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-1">
          {status === 'idle' ? 'Conversar com Sensei' : 
           status === 'connecting' ? 'Chamando o Sensei...' : 
           status === 'listening' ? 'Pode falar, estou ouvindo!' : 'Sensei está falando...'}
        </h3>
        <p className="text-slate-400 text-sm">
          {isActive ? 'A conversa está ativa. Fale naturalmente.' : 'Clique no botão abaixo para ligar.'}
        </p>
      </div>

      {transcription && (
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-indigo-500/10 min-h-[4rem] flex items-center justify-center animate-in fade-in zoom-in-95">
          <p className="text-indigo-200 italic text-lg leading-relaxed">
            "{transcription.slice(-100)}"
          </p>
        </div>
      )}

      <div className="pt-4">
        {!isActive ? (
          <button 
            onClick={startSession}
            disabled={isOffline || status === 'connecting'}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-extrabold text-xl shadow-xl shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <span>🚀</span> INICIAR CONVERSA
          </button>
        ) : (
          <button 
            onClick={stopSession}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border-2 border-red-500/30 px-10 py-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3"
          >
            <span>🛑</span> ENCERRAR CHAMADA
          </button>
        )}
      </div>

      <div className="flex justify-center gap-8 pt-4">
        <div className="flex flex-col items-center gap-1">
          <div className={`w-3 h-3 rounded-full ${status === 'listening' ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-slate-600'}`}></div>
          <span className="text-[10px] uppercase font-bold text-slate-500">Ouvindo</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className={`w-3 h-3 rounded-full ${status === 'speaking' ? 'bg-indigo-500 shadow-[0_0_10px_indigo]' : 'bg-slate-600'}`}></div>
          <span className="text-[10px] uppercase font-bold text-slate-500">Sensei</span>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default VoiceTutor;
