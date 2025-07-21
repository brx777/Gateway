import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Building2, Plus, Key, Webhook, Mail, Copy, CheckCheck } from "lucide-react";
import type { Merchant } from "@shared/schema";

const createMerchantSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  webhookUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export default function Merchants() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: merchantsData, isLoading } = useQuery({
    queryKey: ["/api/merchants"],
  });

  const createMerchantMutation = useMutation({
    mutationFn: (data: z.infer<typeof createMerchantSchema>) =>
      apiRequest("POST", "/api/merchants", data),
    onSuccess: () => {
      toast({
        title: "Merchant criado",
        description: "Merchant criado com sucesso!",
      });
      setIsCreateOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/merchants"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar merchant",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof createMerchantSchema>>({
    resolver: zodResolver(createMerchantSchema),
    defaultValues: {
      name: "",
      email: "",
      webhookUrl: "",
    },
  });

  const merchants: Merchant[] = (merchantsData as any)?.merchants || [];

  const copyToClipboard = async (text: string, merchantId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(`merchant-${merchantId}`);
      toast({
        title: "Copiado!",
        description: "API Key copiada para a área de transferência",
      });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao copiar para a área de transferência",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Merchants</h1>
              <p className="text-gray-600 dark:text-gray-400">Gerencie merchants e suas chaves de API</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Merchant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Merchant</DialogTitle>
                  <DialogDescription>
                    Crie um novo merchant para integração via API
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createMerchantMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Merchant</FormLabel>
                          <FormControl>
                            <Input placeholder="Minha Empresa LTDA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@minhaempresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Webhook (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://minhaempresa.com/webhook" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createMerchantMutation.isPending}>
                      {createMerchantMutation.isPending ? "Criando..." : "Criar Merchant"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : merchants.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum merchant cadastrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Crie seu primeiro merchant para começar a integrar com o gateway
              </p>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Merchant
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {merchants.map((merchant) => (
              <Card key={merchant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      {merchant.name}
                    </div>
                    <Badge variant={merchant.isActive ? "default" : "secondary"}>
                      {merchant.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {merchant.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* API Key */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Key</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono break-all">
                        {merchant.apiKey}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(merchant.apiKey, merchant.id)}
                        className="flex-shrink-0"
                      >
                        {copiedKey === `merchant-${merchant.id}` ? (
                          <CheckCheck className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Webhook URL */}
                  {merchant.webhookUrl && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Webhook className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Webhook</span>
                      </div>
                      <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono break-all">
                        {merchant.webhookUrl}
                      </code>
                    </div>
                  )}

                  {/* Creation Date */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Criado em {new Date(merchant.createdAt!).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* API Documentation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Documentação da API</CardTitle>
            <CardDescription>
              Como integrar com o gateway de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Processar Pagamento</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                <pre className="text-sm">
{`POST /api/gateway/process-payment
Content-Type: application/json

{
  "apiKey": "pk_seu_api_key_aqui",
  "amount": 100.00,
  "currency": "BRL",
  "description": "Pagamento do produto X",
  "paymentMethod": {
    "type": "credit_card",
    "cardNumber": "4111111111111111",
    "cardHolderName": "João Silva",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123"
  }
}`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Resposta de Sucesso</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                <pre className="text-sm">
{`{
  "transaction_id": "TXN_1640995200000_abc123def",
  "status": "completed",
  "amount": "100.00",
  "currency": "BRL",
  "processed_at": "2025-01-21T12:00:00.000Z"
}`}
                </pre>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Importante</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Mantenha sua API Key segura e nunca a exponha publicamente</li>
                <li>• Use HTTPS para todas as requisições de produção</li>
                <li>• Configure webhooks para receber notificações de status</li>
                <li>• Implemente retry logic para requisições com falha</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}