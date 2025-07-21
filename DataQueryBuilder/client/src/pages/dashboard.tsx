import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, DollarSign, Activity, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { Transaction } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: () => fetch("/api/transactions").then(res => res.json())
  });

  const transactions: Transaction[] = transactionsData?.transactions || [];

  // Calculate metrics
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const successRate = totalTransactions > 0 ? (completedTransactions.length / totalTransactions) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      pending: "secondary",
      processing: "outline"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Visão geral do seu gateway de pagamento</p>
            </div>
            <div className="flex gap-3">
              <Link href="/payments/new">
                <Button>Nova Transação</Button>
              </Link>
              <Link href="/merchants/new">
                <Button variant="outline">Novo Merchant</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +{completedTransactions.length} transações aprovadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                Total de transações processadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Aprovações vs tentativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativas Hoje</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions.filter(t => {
                  const today = new Date().toDateString();
                  const transactionDate = new Date(t.createdAt!).toDateString();
                  return today === transactionDate;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Transações de hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transações Recentes</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>
                  Últimas transações processadas pelo gateway
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhuma transação ainda
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Comece processando sua primeira transação
                    </p>
                    <Link href="/payments/new">
                      <Button>Criar Transação</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {transaction.description || 'Sem descrição'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {transaction.referenceId}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              R$ {parseFloat(transaction.amount).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(transaction.createdAt!).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas por Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['completed', 'pending', 'failed', 'processing'].map(status => {
                    const count = transactions.filter(t => t.status === status).length;
                    const percentage = totalTransactions > 0 ? (count / totalTransactions) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="capitalize">{status}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{count}</span>
                          <span className="text-sm text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Transações Aprovadas:</span>
                    <span className="font-medium">{completedTransactions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor Médio:</span>
                    <span className="font-medium">
                      R$ {completedTransactions.length > 0 ? (totalRevenue / completedTransactions.length).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maior Transação:</span>
                    <span className="font-medium">
                      R$ {completedTransactions.length > 0 ? Math.max(...completedTransactions.map(t => parseFloat(t.amount))).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <span className="font-medium">Receita Total:</span>
                    <span className="font-bold text-green-600">R$ {totalRevenue.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Gateway</CardTitle>
                <CardDescription>
                  Configure as opções do seu gateway de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/merchants">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <CreditCard className="w-6 h-6" />
                      Gerenciar Merchants
                    </Button>
                  </Link>
                  <Link href="/payments">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <Activity className="w-6 h-6" />
                      Ver Todas Transações
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}