
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getTutorResponse = async (userMessage: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  // Inicializamos o chat com o histórico recebido para manter o contexto
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history,
    config: {
      systemInstruction: "Você é o 'Japostar Sensei', um tutor amigável e encorajador de língua japonesa para falantes de português. Explique conceitos de gramática, traduza frases, sugira palavras e ajude o aluno a praticar Hiragana, Katakana e Kanji. Use emojis de estrelas e espaço para manter o tema 'Japostar'. Sempre forneça a leitura em Romaji para palavras em Japonês.",
    },
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text;
};

export const generateQuiz = async (lessonTitle: string, category: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere um quiz interativo de 5 perguntas para a lição "${lessonTitle}" (Categoria: ${category}). 
    O quiz deve ser para iniciantes em japonês. 
    Retorne apenas o JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  
  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse quiz", e);
    return [];
  }
};
