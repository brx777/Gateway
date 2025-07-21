import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  CreditCard, 
  Shield, 
  Zap, 
  BarChart3, 
  Users, 
  Globe,
  CheckCircle,
  TrendingUp,
  Lock,
  LogOut,
  User
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

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
        
        <nav className="hidden md:flex space-x-8">
          <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 dark:text-gray-300">
            Dashboard
          </Link>
          <Link href="/payments" className="text-gray-600 hover:text-blue-600 dark:text-gray-300">
            Pagamentos
          </Link>
          <Link href="/merchants" className="text-gray-600 hover:text-blue-600 dark:text-gray-300">
            Merchants
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <User className="h-4 w-4" />
              <span>{user.firstName || user.email}</span>
            </div>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.location.href = '/api/logout'}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <Badge variant="secondary" className="mb-4">
          Bem-vindo ao PayGateway 🎉
        </Badge>
        
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Sua Central de
          <span className="text-blue-600 block">Pagamentos Online</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Gerencie transações, monitore pagamentos e acompanhe suas métricas em tempo real
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Ver Dashboard
            </Button>
          </Link>
          <Link href="/payments">
            <Button variant="outline" size="lg" className="px-8 py-3">
              Gerenciar Pagamentos
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Acesso Rápido
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader>
                <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 w-fit">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>
                  Visualize métricas, receita e transações em tempo real
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/payments">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader>
                <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3 w-fit">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Pagamentos</CardTitle>
                <CardDescription>
                  Gerencie métodos de pagamento e processe transações
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/merchants">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader>
                <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3 w-fit">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Merchants</CardTitle>
                <CardDescription>
                  Administre parceiros e suas chaves de API
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16 bg-white/50 dark:bg-gray-800/50 rounded-3xl mx-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Recursos Disponíveis
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Aproveite todos os recursos do seu gateway de pagamento
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Segurança Total</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Transações protegidas com criptografia de ponta
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Processamento Rápido</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Aprovação em segundos com alta taxa de sucesso
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Relatórios Detalhados</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Análises completas de performance e receita
            </p>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">API RESTful</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Integração simples com documentação completa
            </p>
          </div>

          <div className="text-center">
            <div className="bg-teal-100 dark:bg-teal-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lock className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Compliance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Certificação PCI DSS e normas bancárias
            </p>
          </div>

          <div className="text-center">
            <div className="bg-red-100 dark:bg-red-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Suporte 24/7</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Atendimento especializado sempre disponível
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
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
      </footer>
    </div>
  );
}