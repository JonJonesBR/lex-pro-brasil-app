
import { GoogleGenAI } from "@google/genai";

/**
 * Inicializa e retorna uma instância do cliente GoogleGenAI.
 * 
 * @param apiKey A chave da API para autenticar com o serviço Gemini.
 * @returns Uma instância de GoogleGenAI se a inicialização for bem-sucedida, caso contrário, null.
 */
export const initializeGeminiClient = async (apiKey: string): Promise<GoogleGenAI | null> => {
    if (!apiKey) {
        console.error("GeminiService: API Key não fornecida para inicialização.");
        return null;
    }

    try {
        const aiClient = new GoogleGenAI({ apiKey });
        // Opcional: Você pode adicionar uma chamada de teste aqui para verificar a validade da chave,
        // mas a simples inicialização já pode lançar erros para chaves mal formatadas.
        // Exemplo: await aiClient.models.listModels(); 
        console.log("GeminiService: Cliente GoogleGenAI inicializado com sucesso.");
        return aiClient;
    } catch (error) {
        console.error("GeminiService: Erro ao inicializar o cliente GoogleGenAI.", error);
        // Em um app real, você poderia tratar diferentes tipos de erro aqui.
        // Por exemplo, se o erro for específico sobre a API key inválida.
        return null;
    }
};

// Exemplo de como você poderia ter uma instância global (opcional e depende da sua arquitetura)
// let globalAiClient: GoogleGenAI | null = null;

// export const getGlobalAiClient = async (apiKey?: string): Promise<GoogleGenAI | null> => {
//   if (globalAiClient) {
//     return globalAiClient;
//   }
//   if (apiKey) {
//     globalAiClient = await initializeGeminiClient(apiKey);
//     return globalAiClient;
//   }
//   console.warn("GeminiService: Tentativa de obter cliente global sem API Key e sem cliente previamente inicializado.");
//   return null;
// };

// export const setGlobalApiKey = async (apiKey: string) => {
//    globalAiClient = await initializeGeminiClient(apiKey);
//    if (!globalAiClient) {
//      throw new Error("Falha ao configurar a API Key global do Gemini.");
//    }
// };
