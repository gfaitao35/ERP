"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { PageHeader } from "@/components/erp/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
  Settings,
  Building2,
  Users,
  Shield,
  Bell,
  CreditCard,
  Database,
  Plug,
  Mail,
  Globe,
  Palette,
  Save,
  Upload,
} from "lucide-react"

export default function SettingsPage() {
  const { tenant, user } = useAuth()
  const [companySettings, setCompanySettings] = useState({
    name: tenant?.name || "",
    tradeName: "",
    document: tenant?.document || "",
    email: "",
    phone: "",
    website: "",
    address: "",
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    lowStockAlerts: true,
    paymentReminders: true,
    salesReports: false,
    systemUpdates: true,
  })

  const [systemSettings, setSystemSettings] = useState({
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    currency: "BRL",
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações do sistema"
        icon={<Settings className="h-6 w-6" />}
      />

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="empresa" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="integracao" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="empresa">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dados da Empresa</CardTitle>
                <CardDescription>
                  Informações cadastrais da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG ou SVG. Máximo 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Razão Social</FieldLabel>
                      <Input
                        value={companySettings.name}
                        onChange={(e) =>
                          setCompanySettings({ ...companySettings, name: e.target.value })
                        }
                        placeholder="Razão social da empresa"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Nome Fantasia</FieldLabel>
                      <Input
                        value={companySettings.tradeName}
                        onChange={(e) =>
                          setCompanySettings({ ...companySettings, tradeName: e.target.value })
                        }
                        placeholder="Nome fantasia"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>CNPJ</FieldLabel>
                      <Input
                        value={companySettings.document}
                        onChange={(e) =>
                          setCompanySettings({ ...companySettings, document: e.target.value })
                        }
                        placeholder="00.000.000/0000-00"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>E-mail</FieldLabel>
                      <Input
                        type="email"
                        value={companySettings.email}
                        onChange={(e) =>
                          setCompanySettings({ ...companySettings, email: e.target.value })
                        }
                        placeholder="contato@empresa.com"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Telefone</FieldLabel>
                      <Input
                        value={companySettings.phone}
                        onChange={(e) =>
                          setCompanySettings({ ...companySettings, phone: e.target.value })
                        }
                        placeholder="(00) 0000-0000"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Website</FieldLabel>
                      <Input
                        value={companySettings.website}
                        onChange={(e) =>
                          setCompanySettings({ ...companySettings, website: e.target.value })
                        }
                        placeholder="https://www.empresa.com"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup className="col-span-2">
                    <Field>
                      <FieldLabel>Endereço Completo</FieldLabel>
                      <Textarea
                        value={companySettings.address}
                        onChange={(e) =>
                          setCompanySettings({ ...companySettings, address: e.target.value })
                        }
                        placeholder="Rua, número, bairro, cidade - UF, CEP"
                        rows={2}
                      />
                    </Field>
                  </FieldGroup>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plano Atual</CardTitle>
                <CardDescription>
                  Detalhes do seu plano de assinatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{tenant?.plan || "Professional"}</h3>
                      <Badge variant="default" className="bg-primary">Ativo</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tenant?.maxUsers || 10} usuários | Todos os módulos | Suporte prioritário
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">R$ 299</p>
                    <p className="text-sm text-muted-foreground">/mês</p>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Gerenciar Assinatura
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Settings */}
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Usuários do Sistema</CardTitle>
                  <CardDescription>
                    Gerencie os usuários e permissões
                  </CardDescription>
                </div>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Convidar Usuário
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current User */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user?.name?.charAt(0) || "A"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user?.name || "Administrador"}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-primary">Admin</Badge>
                    <Badge variant="outline">Você</Badge>
                  </div>
                </div>

                {/* Other Users Mock */}
                {[
                  { name: "Maria Silva", email: "maria@empresa.com", role: "Gerente" },
                  { name: "João Santos", email: "joao@empresa.com", role: "Vendedor" },
                  { name: "Ana Costa", email: "ana@empresa.com", role: "Financeiro" },
                ].map((mockUser, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {mockUser.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{mockUser.name}</p>
                        <p className="text-sm text-muted-foreground">{mockUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{mockUser.role}</Badge>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="seguranca">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Autenticação</CardTitle>
                <CardDescription>
                  Configurações de segurança e autenticação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autenticação de Dois Fatores (2FA)</p>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Login com SSO</p>
                    <p className="text-sm text-muted-foreground">
                      Permitir login com Google, Microsoft, etc.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Expiração de Sessão</p>
                    <p className="text-sm text-muted-foreground">
                      Tempo máximo de inatividade
                    </p>
                  </div>
                  <Select defaultValue="60">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="480">8 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Acesso</CardTitle>
                <CardDescription>
                  Últimos acessos à sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "Hoje, 14:32", device: "Chrome / Windows", location: "São Paulo, BR", current: true },
                    { date: "Hoje, 09:15", device: "Safari / macOS", location: "São Paulo, BR", current: false },
                    { date: "Ontem, 18:45", device: "Chrome / Android", location: "São Paulo, BR", current: false },
                  ].map((access, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-sm">{access.device}</p>
                        <p className="text-xs text-muted-foreground">
                          {access.date} - {access.location}
                        </p>
                      </div>
                      {access.current ? (
                        <Badge variant="outline" className="border-success text-success">
                          Sessão Atual
                        </Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-destructive">
                          Encerrar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferências de Notificação</CardTitle>
              <CardDescription>
                Escolha como deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Alertas por E-mail</p>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas importantes por e-mail
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailAlerts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Bell className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">Alertas de Estoque Baixo</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando produtos atingirem estoque mínimo
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.lowStockAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, lowStockAlerts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <CreditCard className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium">Lembretes de Pagamento</p>
                    <p className="text-sm text-muted-foreground">
                      Lembrar de contas a pagar próximas do vencimento
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.paymentReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, paymentReminders: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Database className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Relatórios de Vendas</p>
                    <p className="text-sm text-muted-foreground">
                      Receber relatórios semanais de vendas
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.salesReports}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, salesReports: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Settings className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="font-medium">Atualizações do Sistema</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar sobre novas funcionalidades e melhorias
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, systemUpdates: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integracao">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Integrações Disponíveis</CardTitle>
              <CardDescription>
                Conecte com outros sistemas e serviços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "NFe / NFCe", desc: "Emissão de notas fiscais", connected: true },
                  { name: "PIX / Boletos", desc: "Integração bancária", connected: true },
                  { name: "WhatsApp", desc: "Envio de mensagens automáticas", connected: false },
                  { name: "Marketplace", desc: "Integração com e-commerce", connected: false },
                  { name: "Contabilidade", desc: "Envio automático para contador", connected: false },
                  { name: "BI / Analytics", desc: "Dashboards avançados", connected: false },
                ].map((integration, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">{integration.desc}</p>
                    </div>
                    {integration.connected ? (
                      <Badge variant="default" className="bg-success">Conectado</Badge>
                    ) : (
                      <Button variant="outline" size="sm">
                        Conectar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="sistema">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preferências do Sistema</CardTitle>
                <CardDescription>
                  Configurações gerais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Idioma
                      </FieldLabel>
                      <Select
                        value={systemSettings.language}
                        onValueChange={(value) =>
                          setSystemSettings({ ...systemSettings, language: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Fuso Horário</FieldLabel>
                      <Select
                        value={systemSettings.timezone}
                        onValueChange={(value) =>
                          setSystemSettings({ ...systemSettings, timezone: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                          <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                          <SelectItem value="America/Belem">Belém (GMT-3)</SelectItem>
                          <SelectItem value="America/Recife">Recife (GMT-3)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Formato de Data</FieldLabel>
                      <Select
                        value={systemSettings.dateFormat}
                        onValueChange={(value) =>
                          setSystemSettings({ ...systemSettings, dateFormat: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Moeda</FieldLabel>
                      <Select
                        value={systemSettings.currency}
                        onValueChange={(value) =>
                          setSystemSettings({ ...systemSettings, currency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">Real (R$)</SelectItem>
                          <SelectItem value="USD">Dólar (US$)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                </div>
                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Tema e Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tema Escuro</p>
                    <p className="text-sm text-muted-foreground">
                      Interface otimizada para baixa luminosidade
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
