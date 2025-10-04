export const mockUser = {
  id: 1,
  name: "Maria Silva",
  email: "maria@exemplo.com",
  createdAt: "2024-01-15",
  totalSessions: 24,
  currentStreak: 7,
  growthScore: 78
};

export const mockQuizQuestions = [
  {
    id: 1,
    question: "Como você se sente quando está sozinho(a)?",
    type: "scale",
    options: [
      { value: 1, label: "Muito desconfortável" },
      { value: 2, label: "Desconfortável" },
      { value: 3, label: "Neutro" },
      { value: 4, label: "Confortável" },
      { value: 5, label: "Muito confortável" }
    ]
  },
  {
    id: 2,
    question: "O que mais te preocupa atualmente?",
    type: "multiple",
    options: [
      { value: "relacionamentos", label: "Relacionamentos" },
      { value: "carreira", label: "Carreira" },
      { value: "saude", label: "Saúde" },
      { value: "financas", label: "Finanças" },
      { value: "autoestima", label: "Autoestima" }
    ]
  },
  {
    id: 3,
    question: "Descreva como você se sente em uma frase:",
    type: "text",
    placeholder: "Digite seus sentimentos..."
  }
];

export const mockChatMessages = [
  {
    id: 1,
    type: "ai",
    message: "Olá Maria! Sou seu Gêmeo IA. Como você está se sentindo hoje?",
    timestamp: "2024-01-20 10:00:00"
  },
  {
    id: 2,
    type: "user",
    message: "Estou me sentindo um pouco ansiosa sobre meu trabalho.",
    timestamp: "2024-01-20 10:01:00"
  },
  {
    id: 3,
    type: "ai",
    message: "Entendo sua ansiedade sobre o trabalho. Com base no que sei sobre você, parece que você valoriza muito o desempenho profissional. Vamos explorar juntos o que especificamente está causando essa ansiedade?",
    timestamp: "2024-01-20 10:01:30"
  }
];

export const mockAnalysis = {
  emotionalState: {
    primary: "Ansiedade",
    level: 65,
    factors: [
      { name: "Pressão no trabalho", percentage: 40 },
      { name: "Relacionamentos", percentage: 25 },
      { name: "Incerteza futura", percentage: 35 }
    ]
  },
  growthAreas: [
    {
      area: "Inteligência Emocional",
      progress: 72,
      recommendations: ["Prática de mindfulness", "Técnicas de respiração"]
    },
    {
      area: "Tomada de Decisão",
      progress: 68,
      recommendations: ["Análise de prós e contras", "Confiança na intuição"]
    },
    {
      area: "Relacionamentos",
      progress: 81,
      recommendations: ["Comunicação assertiva", "Estabelecer limites"]
    }
  ]
};

export const mockStats = {
  totalUsers: "36.389+",
  rating: 4.9,
  reviews: "1.200+",
  languages: 28,
  successRate: {
    betterDecisions: 87,
    selfAwareness: 74,
    goalProgress: 86
  }
};