import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Shield, 
  Zap, 
  BarChart3, 
  Users, 
  Globe,
  CheckCircle,
  TrendingUp,
  Lock
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 rounded-lg p-2">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">PayGateway</span>
        </div>
        
        <Button 
          onClick={() => window.location.href = '/api/login'}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Fazer Login
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          Gateway de Pagamento Brasileiro 🇧🇷
        </Badge>
        
        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Processar Pagamentos
          <span className="text-blue-600 block">Nunca Foi Tão Simples</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Gateway de pagamento completo com suporte a cartão de crédito, débito, PIX e boleto. 
          Integração fácil, taxas transparentes e dashboard em tempo real.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
          >
            Começar Agora
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-3"
          >
            Ver Documentação
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Sem taxas de setup
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            API RESTful
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Dashboard em tempo real
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tudo que você precisa para receber pagamentos
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ferramentas completas para processar, gerenciar e analisar seus pagamentos online
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 w-fit">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Múltiplos Métodos</CardTitle>
              <CardDescription>
                Aceite cartão de crédito, débito, PIX e boleto bancário
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3 w-fit">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Segurança Total</CardTitle>
              <CardDescription>
                Criptografia de ponta e compliance PCI DSS
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3 w-fit">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Processamento Rápido</CardTitle>
              <CardDescription>
                Aprovação em segundos com alta taxa de sucesso
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-orange-100 dark:bg-orange-900 rounded-lg p-3 w-fit">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Dashboard Completo</CardTitle>
              <CardDescription>
                Métricas em tempo real e relatórios detalhados
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-teal-100 dark:bg-teal-900 rounded-lg p-3 w-fit">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Gestão de Merchants</CardTitle>
              <CardDescription>
                Sistema completo para gerenciar múltiplos parceiros
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-red-100 dark:bg-red-900 rounded-lg p-3 w-fit">
                <Globe className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>API RESTful</CardTitle>
              <CardDescription>
                Integração simples e documentação completa
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 mr-2" />
                <span className="text-4xl font-bold">99.9%</span>
              </div>
              <p className="text-blue-100">Uptime garantido</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 mr-2" />
                <span className="text-4xl font-bold">&lt;2s</span>
              </div>
              <p className="text-blue-100">Tempo de processamento</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Lock className="h-8 w-8 mr-2" />
                <span className="text-4xl font-bold">PCI DSS</span>
              </div>
              <p className="text-blue-100">Certificação de segurança</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Pronto para começar?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Crie sua conta e comece a processar pagamentos em minutos
        </p>
        
        <Button 
          size="lg" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          onClick={() => window.location.href = '/api/login'}
        >
          Criar Conta Gratuita
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-blue-600 rounded-lg p-2">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">PayGateway</span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2025 PayGateway. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}