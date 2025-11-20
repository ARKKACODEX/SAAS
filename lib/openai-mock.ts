/**
 * OpenAI Mock Client Library
 * Substitui a integração real com OpenAI para fins de demonstração.
 */

// Mock do cliente OpenAI
export const openaiMock = {
  chat: {
    completions: {
      create: async (options: any) => {
        console.log(`[MOCK OPENAI] Gerando resposta para: ${options.messages[options.messages.length - 1].content}`)
        
        const mockResponse = {
          choices: [
            {
              message: {
                content: "Hello! I am the ReplyHub AI assistant. This is a demonstration of our AI capabilities. Since this is a mock environment, I can't connect to a real AI model, but I can confirm that the integration is working correctly. How can I help you today?",
              },
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 30,
            total_tokens: 130,
          },
        }

        // Simula a extração de lead se o prompt for de extração
        if (options.messages[0].content.includes('Extract contact information')) {
            mockResponse.choices[0].message.content = JSON.stringify({
                name: "John Doe",
                email: "john.doe@example.com",
                phone: "+15551234567",
                intent: "Mock lead captured for demonstration"
            })
        }

        return mockResponse
      },
    },
  },
}
