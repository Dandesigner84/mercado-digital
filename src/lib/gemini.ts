import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getShoppingAssistantResponse(prompt: string, history: any[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: "Você é um assistente de compras de um supermercado digital. Ajude o usuário a encontrar produtos, sugira itens baseados em categorias (padaria, bebidas, limpeza, mercearia, hortifruti) e seja cordial." }] },
        ...history,
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, tive um problema ao processar sua solicitação. Como posso ajudar com suas compras?";
  }
}

export async function getProductSuggestions(cartItems: string[]) {
  if (cartItems.length === 0) return [];
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Baseado nestes itens no carrinho: ${cartItems.join(", ")}, sugira 3 produtos complementares que costumam ser comprados juntos em um supermercado.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["name", "reason"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Suggestions Error:", error);
    return [];
  }
}
