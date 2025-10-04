import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  ChevronRight,
  Lightbulb,
  Heart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { mockAnalysis } from "../data/mock";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const [analysis, setAnalysis] = useState(mockAnalysis);

  useEffect(() => {
    // Check if user is logged in using AuthContext
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-3 bg-${color}-100 rounded-full`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const GrowthAreaCard = ({ area }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-800">{area.area}</h4>
          <span className="text-sm font-medium text-blue-600">{area.progress}%</span>
        </div>
        
        <Progress value={area.progress} className="mb-3" />
        
        <div className="space-y-1">
          <p className="text-xs text-gray-600 font-medium">Recomendações:</p>
          {area.recommendations.map((rec, index) => (
            <div key={index} className="flex items-center text-xs text-gray-600">
              <div className="w-1 h-1 bg-blue-500 rounded-full mr-2"></div>
              {rec}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => navigate("/")}
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-blue-600">YOU</span>
              </div>
              
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-800">
                  Bem-vindo de volta, {user.name}!
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate("/conversa")}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversar com IA
              </Button>
              
              <Button
                onClick={() => {
                  localStorage.removeItem("user");
                  navigate("/");
                }}
                variant="outline"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Clock}
            title="Sessões Totais"
            value={user.totalSessions}
            subtitle="Esta semana: +5"
            color="blue"
          />
          <StatCard
            icon={Target}
            title="Sequência Atual"
            value={`${user.currentStreak} dias`}
            subtitle="Recorde pessoal!"
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            title="Pontuação de Crescimento"
            value={`${user.growthScore}%`}
            subtitle="+12% este mês"
            color="purple"
          />
          <StatCard
            icon={Award}
            title="Nível"
            value="Explorador"
            subtitle="Próximo: Pensador"
            color="orange"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Emotional Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Análise Emocional Atual</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">
                      Estado primário: {analysis.emotionalState.primary}
                    </h4>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {analysis.emotionalState.level}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {analysis.emotionalState.factors.map((factor, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{factor.name}</span>
                          <span className="font-medium">{factor.percentage}%</span>
                        </div>
                        <Progress value={factor.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate("/conversa")}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Explorar com seu Gêmeo IA
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <span>Insights Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h5 className="font-medium text-gray-800">Padrão de Ansiedade Identificado</h5>
                    <p className="text-sm text-gray-600">
                      Seu Gêmeo IA notou que você tende a sentir mais ansiedade nas segundas-feiras. 
                      Considere técnicas de preparação no domingo.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h5 className="font-medium text-gray-800">Progresso na Comunicação</h5>
                    <p className="text-sm text-gray-600">
                      Suas habilidades de comunicação assertiva melhoraram 23% nas últimas duas semanas.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <h5 className="font-medium text-gray-800">Momento de Gratidão</h5>
                    <p className="text-sm text-gray-600">
                      Você mencionou gratidão 8 vezes esta semana - isso é excelente para seu bem-estar emocional.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate("/conversa")}
                  className="w-full justify-start bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nova Conversa
                </Button>
                
                <Button 
                  onClick={() => navigate("/quiz")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Refazer Avaliação
                </Button>
                
                <Button 
                  onClick={() => navigate("/analiticas")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ver Progresso Completo
                </Button>
                
                <Button 
                  onClick={() => navigate("/objetivos")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Meus Objetivos
                </Button>
                
                <Button 
                  onClick={() => navigate("/configuracoes")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </CardContent>
            </Card>

            {/* Growth Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Áreas de Crescimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.growthAreas.map((area, index) => (
                  <GrowthAreaCard key={index} area={area} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;