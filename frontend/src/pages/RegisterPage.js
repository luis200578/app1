import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Brain, Menu, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Erro no cadastro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    
    if (result.success) {
      navigate("/quiz"); // Go to quiz after successful registration
    }
    
    setIsLoading(false);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600">YOU</span>
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-8">
              <h1 className="text-2xl font-bold text-blue-500 mb-2">
                Crie sua conta
              </h1>
              <p className="text-gray-600">
                Comece sua jornada de autodescoberta
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Endereço de e-mail
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Crie uma senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">
                    Confirmar senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
                >
                  Criar conta
                </Button>
              </form>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{" "}
                  <button 
                    onClick={() => navigate("/login")}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Faça login
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            Rua das Flores, 123, São Paulo, SP, Brasil
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;