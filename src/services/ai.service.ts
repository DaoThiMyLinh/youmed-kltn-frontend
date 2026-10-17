import axiosClient from '../api/axiosClient';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DoctorSummary {
  id: number;
  fullName: string;
  specialtyName: string;
  consultationFee: number;
  biography: string;
  imageUrl?: string;
  targetDate?: string;
  availableSlots?: string[];
}

export interface SpecialtySummary {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface AiChatResponse {
  reply: string;
  intent: string;
  suggestedSpecialty?: SpecialtySummary | null;
  suggestedDoctors?: DoctorSummary[] | null;
  quickSuggestions?: string[] | null;
}

export const aiService = {
  chat: async (message: string, history: ChatMessage[] = []): Promise<AiChatResponse> => {
    const response = await axiosClient.post<AiChatResponse>(
      '/ai/chat',
      {
        message,
        history,
      },
      {
        timeout: 30000,
      }
    );
    return response.data;
  },

  getWelcome: async (): Promise<AiChatResponse> => {
    const response = await axiosClient.get<AiChatResponse>('/ai/welcome');
    return response.data;
  },
};
