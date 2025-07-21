import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreditCard, Plus, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar } from "lucide-react";
import type { Transaction, User as UserType, PaymentMethod } from "@shared/schema";

// Schema for creating users
const createUserSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  fullName: z.string().optional(),
});

// Schema for creating payment methods
const createPaymentMethodSchema = z.object({
  userId: z.number(),
  type: z.enum(["credit_card", "debit_card", "pix", "boleto"]),
  cardHolderName: z.string().min(3, "Nome do portador é obrigatório"),
  cardNumber: z.string().min(16, "Número do cartão deve ter pelo menos 16 dígitos").max(19),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(new Date().getFullYear()),
});

// Schema for creating transactions
const createTransactionSchema = z.object({
  userId: z.number(),
  paymentMethodId: z.number(),
  amount: z.string().min(1, "Valor é obrigatório"),
  currency: z.string().default("BRL"),
  description: z.string().optional(),
});

export default function Payments() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreatePaymentMethodOpen, setIsCreatePaymentMethodOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const { toast } = useToast();

  // Queries
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: usersData } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => Promise.resolve({ users: [] }) // Mock for now since we don't have a users list endpoint
  });

  const { data: paymentMethodsData } = useQuery({
    queryKey: ["/api/users", selectedUserId, "payment-methods"],
    enabled: !!selectedUserId,
    queryFn: () => selectedUserId ? 
      fetch(`/api/users/${selectedUserId}/payment-methods`).then(res => res.json()) :
      Promise.resolve({ paymentMethods: [] })
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (data: z.infer<typeof createUserSchema>) =>
      apiRequest("POST", "/api/users", data),
    onSuccess: (response) => {
      toast({
        title: "Usuário criado",
        description: "Usuário criado com sucesso!",
      });
      setIsCreateUserOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário",
        variant: "destructive",
      });
    },
  });

  const createPaymentMethodMutation = useMutation({
    mutationFn: (data: z.infer<typeof createPaymentMethodSchema>) =>
      apiRequest("POST", "/api/payment-methods", data),
    onSuccess: () => {
      toast({
        title: "Método de pagamento criado",
        description: "Método de pagamento adicionado com sucesso!",
      });
      setIsCreatePaymentMethodOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users", selectedUserId, "payment-methods"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar método de pagamento",
        variant: "destructive",
      });
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data: z.infer<typeof createTransactionSchema>) =>
      apiRequest("POST", "/api/transactions", data),
    onSuccess: () => {
      toast({
        title: "Transação criada",
        description: "Transação processada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar transação",
        variant: "destructive",
      });
    },
  });

  // Forms
  const userForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
    },
  });

  const paymentMethodForm = useForm<z.infer<typeof createPaymentMethodSchema>>({
    resolver: zodResolver(createPaymentMethodSchema),
    defaultValues: {
      userId: 0,
      type: "credit_card",
      cardHolderName: "",
      cardNumber: "",
      expiryMonth: 1,
      expiryYear: new Date().getFullYear(),
    },
  });

  const transactionForm = useForm<z.infer<typeof createTransactionSchema>>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      userId: 0,
      paymentMethodId: 0,
      amount: "",
      currency: "BRL",
      description: "",
    },
  });

  const transactions: Transaction[] = (transactionsData as any)?.transactions || [];
  const paymentMethods: PaymentMethod[] = paymentMethodsData?.paymentMethods || [];

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
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pagamentos</h1>
              <p className="text-gray-600 dark:text-gray-400">Gerencie transações e métodos de pagamento</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="create">Nova Transação</TabsTrigger>
            <TabsTrigger value="methods">Métodos de Pagamento</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Transações</CardTitle>
                <CardDescription>Histórico completo de transações processadas</CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhuma transação encontrada
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Comece criando sua primeira transação
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
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
                              {transaction.referenceId} • {new Date(transaction.createdAt!).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              R$ {parseFloat(transaction.amount).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {transaction.currency}
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

          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick User Creation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Criar Usuário Rápido
                  </CardTitle>
                  <CardDescription>
                    Crie um usuário para processar pagamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={userForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome de usuário</FormLabel>
                            <FormControl>
                              <Input placeholder="usuario123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="usuario@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo (opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="João Silva" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                        {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Transaction Creation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Nova Transação
                  </CardTitle>
                  <CardDescription>
                    Processe um novo pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...transactionForm}>
                    <form onSubmit={transactionForm.handleSubmit((data) => createTransactionMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={transactionForm.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID do Usuário</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1"
                                {...field}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  field.onChange(value);
                                  setSelectedUserId(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={transactionForm.control}
                        name="paymentMethodId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Método de Pagamento</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um método" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {paymentMethods.map((method) => (
                                  <SelectItem key={method.id} value={method.id.toString()}>
                                    {method.cardNumber} - {method.cardHolderName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={transactionForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="100.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={transactionForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição (opcional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Descrição da transação" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={createTransactionMutation.isPending}>
                        {createTransactionMutation.isPending ? "Processando..." : "Processar Pagamento"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="methods">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Métodos de Pagamento
                    <Dialog open={isCreatePaymentMethodOpen} onOpenChange={setIsCreatePaymentMethodOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Método
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Novo Método de Pagamento</DialogTitle>
                          <DialogDescription>
                            Adicione um novo cartão ou método de pagamento
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...paymentMethodForm}>
                          <form onSubmit={paymentMethodForm.handleSubmit((data) => createPaymentMethodMutation.mutate(data))} className="space-y-4">
                            <FormField
                              control={paymentMethodForm.control}
                              name="userId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ID do Usuário</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={paymentMethodForm.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                      <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                                      <SelectItem value="pix">PIX</SelectItem>
                                      <SelectItem value="boleto">Boleto</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={paymentMethodForm.control}
                              name="cardHolderName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do Portador</FormLabel>
                                  <FormControl>
                                    <Input placeholder="João Silva" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={paymentMethodForm.control}
                              name="cardNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número do Cartão</FormLabel>
                                  <FormControl>
                                    <Input placeholder="1234567890123456" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={paymentMethodForm.control}
                                name="expiryMonth"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Mês</FormLabel>
                                    <FormControl>
                                      <Input type="number" min="1" max="12" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={paymentMethodForm.control}
                                name="expiryYear"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ano</FormLabel>
                                    <FormControl>
                                      <Input type="number" min={new Date().getFullYear()} {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <Button type="submit" className="w-full" disabled={createPaymentMethodMutation.isPending}>
                              {createPaymentMethodMutation.isPending ? "Criando..." : "Adicionar Método"}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription>
                    Gerencie os métodos de pagamento disponíveis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedUserId && paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {method.cardHolderName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {method.cardNumber} • {method.type.replace('_', ' ').toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500">
                              {method.expiryMonth}/{method.expiryYear}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Nenhum método encontrado
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {selectedUserId ? "Este usuário não possui métodos de pagamento" : "Selecione um usuário para ver os métodos"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}