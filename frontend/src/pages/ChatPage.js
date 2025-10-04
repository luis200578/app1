import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Avatar, AvatarContent, AvatarFallback } from "../components/ui/avatar";
import { 
  Brain, 
  Send, 
  ArrowLeft,
  Lightbulb,
  Heart,
  MessageCircle,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { chatAPI } from "../services/api";

const ChatPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, loading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (isAuthenticated) {
      loadConversations();
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getConversations();
      
      if (response.success) {
        setConversations(response.data.conversations);
        
        // If no conversations exist, create a new one
        if (response.data.conversations.length === 0) {
          await createNewConversation();
        } else {
          // Load the most recent conversation
          const mostRecent = response.data.conversations[0];
          setCurrentConversation(mostRecent);
          loadMessages(mostRecent._id);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: error.message || "Não foi possível carregar suas conversas",
        variant: "destructive"
      });
      
      // Create new conversation as fallback
      await createNewConversation();
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await chatAPI.createConversation({
        title: `Nova Conversa - ${new Date().toLocaleDateString('pt-BR')}`,
        tags: ['geral']
      });
      
      if (response.success) {
        const newConv = response.data.conversation;
        setCurrentConversation(newConv);
        setConversations(prev => [newConv, ...prev]);
        setMessages([]);
        
        // Send welcome message
        await sendWelcomeMessage(newConv._id);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Erro ao iniciar conversa",
        description: error.message || "Não foi possível iniciar uma nova conversa",
        variant: "destructive"
      });
    }
  };

  const sendWelcomeMessage = async (conversationId) => {
    try {
      const welcomeMessage = `Olá ${user?.name || 'amigo'}! 👋 Sou seu Gêmeo IA pessoal. Estou aqui para conversar, te ajudar a refletir sobre seus sentimentos e apoiar seu crescimento pessoal. Como você está se sentindo hoje?`;
      
      const response = await chatAPI.sendMessage(conversationId, {
        content: welcomeMessage,
        type: 'ai'
      });
      
      if (response.success) {
        setMessages([response.data.message]);
      }
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await chatAPI.getMessages(conversationId);
      
      if (response.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: error.message || "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    // If no conversation exists, create one first
    if (!currentConversation) {
      await createNewConversation();
      return;
    }

    const userMessage = newMessage.trim();
    setNewMessage("");
    setIsSending(true);
    setIsTyping(true);

    try {
      // Add user message to UI immediately
      const userMessageObj = {
        _id: Date.now().toString(),
        content: userMessage,
        type: 'user',
        timestamp: new Date(),
        sender: user?._id || 'temp'
      };
      
      setMessages(prev => [...prev, userMessageObj]);

      // Send to backend (with safety check)
      if (!currentConversation?._id) {
        throw new Error('Conversa não encontrada');
      }
      
      const response = await chatAPI.sendMessage(currentConversation._id, {
        content: userMessage,
        type: 'user'
      });

      if (response.success) {
        // Replace temporary message with real one and add AI response
        setMessages(prev => {
          const filtered = prev.filter(msg => msg._id !== userMessageObj._id);
          const newMessages = [response.data.userMessage];
          
          if (response.data.aiMessage) {
            newMessages.push(response.data.aiMessage);
          }
          
          return [...filtered, ...newMessages];
        });
        
        toast({
          title: "Mensagem enviada!",
          description: "Seu Gêmeo IA está respondendo...",
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg._id !== userMessageObj._id));
      
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateAIResponse = (userMessage) => {
    const responses = [
      `Entendo que você está se sentindo assim. Com base no que sei sobre você, isso parece estar conectado com seus padrões de pensamento anteriores. Vamos explorar isso mais profundamente?`,
      `Isso é uma observação muito válida. Vejo que você está desenvolvendo maior autoconsciência sobre essa situação. Como isso faz você se sentir?`,
      `Percebo que este tema é importante para você. Baseado em nossas conversas anteriores, você tem mostrado grande crescimento nesta área. O que você acha que mudou?`,
      `Agradeço por compartilhar isso comigo. Sua disposição para refletir sobre esses sentimentos mostra maturidade emocional. Que pequeno passo você poderia dar hoje?`,
      `Vejo um padrão interessante aqui. Você mencionou algo similar na semana passada. Como você se sente sobre essa recorrência?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      message: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);
    
    // Simulate AI typing delay
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        type: "ai",
        message: generateAIResponse(newMessage),
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MessageBubble = ({ message }) => {
    const isAI = message.type === "ai";
    
    return (
      <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isAI ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
          {isAI && (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
          )}
          
          <div className={`px-4 py-2 rounded-2xl ${
            isAI 
              ? 'bg-white border border-gray-200' 
              : 'bg-blue-500 text-white'
          }`}>
            <p className="text-sm leading-relaxed">{message.content || message.message}</p>
            <p className={`text-xs mt-1 ${
              isAI ? 'text-gray-500' : 'text-blue-100'
            }`}>
              {formatTime(message.timestamp)}
            </p>
          </div>
          
          {!isAI && (
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                EU
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    );
  };

  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-end space-x-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        
        <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600">Carregando seu Gêmeo IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate("/dashboard")}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-800">Seu Gêmeo IA</h1>
                  <p className="text-xs text-green-600">● Online</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-600 text-right">
                <p>Conversa segura e privada</p>
                <p>Todas as mensagens são criptografadas</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="max-w-4xl mx-auto">
              {/* Welcome Message */}
              <div className="text-center mb-8">
                <div className="bg-white/80 rounded-lg p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Bem-vindo à sua conversa com o Gêmeo IA
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Este é um espaço seguro para você compartilhar seus pensamentos e sentimentos. 
                    Quanto mais você conversa, melhor eu te entendo.
                  </p>
                </div>
              </div>
              
              {/* Messages */}
              {messages.map((message) => (
                <MessageBubble key={message._id || message.id} message={message} />
              ))}
              
              {/* Typing Indicator */}
              {isTyping && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex space-x-4">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Compartilhe seus pensamentos, sentimentos ou o que está em sua mente..."
                  className="flex-1 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isSending || isTyping}
                />
                <Button 
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={!newMessage.trim() || isSending || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              
              <div className="flex items-center justify-center mt-2">
                <p className="text-xs text-gray-500">
                  Pressione Enter para enviar • Suas conversas são privadas e seguras
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Hidden on mobile, shown on larger screens */}
        <div className="hidden lg:block w-80 bg-white border-l border-gray-200">
          <div className="p-4 space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações da Sessão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duração:</span>
                  <span className="font-medium">12 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mensagens:</span>
                  <span className="font-medium">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Humor detectado:</span>
                  <span className="font-medium text-blue-600">Reflexivo</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tópicos Sugeridos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm h-auto p-3 text-left"
                  onClick={() => setNewMessage("Como posso lidar melhor com a ansiedade no trabalho?")}
                >
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                  Como lidar com ansiedade no trabalho?
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm h-auto p-3 text-left"
                  onClick={() => setNewMessage("Preciso de ajuda para melhorar meus relacionamentos.")}
                >
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  Melhorar relacionamentos
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm h-auto p-3 text-left"
                  onClick={() => setNewMessage("Quero entender melhor meus padrões de comportamento.")}
                >
                  <Brain className="w-4 h-4 mr-2 text-blue-500" />
                  Entender padrões de comportamento
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dicas para uma boa conversa</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 space-y-2">
                <p>• Seja honesto sobre seus sentimentos</p>
                <p>• Compartilhe detalhes específicos</p>
                <p>• Faça perguntas sobre si mesmo</p>
                <p>• Não tenha pressa, reflita</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;