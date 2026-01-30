import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Key, Database, Zap, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function Settings() {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    clientId: "",
    tenantId: "",
    clientSecret: "",
    openaiKey: ""
  });

  const { data: connections, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['/api/connections/status'],
    queryFn: api.getConnectionStatus,
  });

  useEffect(() => {
    if (connections) {
      setCredentials({
        clientId: connections.microsoft365.config?.clientId || "",
        tenantId: connections.microsoft365.config?.tenantId || "",
        clientSecret: "", // Never show secret
        openaiKey: "" // Never show key
      });
    }
  }, [connections]);

  const saveConfigMutation = useMutation({
    mutationFn: (data: any) => api.saveConfig(data),
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "Las credenciales han sido actualizadas correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/connections/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo guardar la configuración.",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCredentials = () => {
    saveConfigMutation.mutate(credentials);
  };

  if (isLoadingConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-settings">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
      </div>

      {/* Microsoft Graph API Configuration */}
      <Card className="hover-elevate">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <Database className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">Microsoft Graph API</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Credenciales para acceso a correos de Outlook y mensajes de Teams
            </p>
          </div>
          <Badge className={connections?.microsoft365?.configured ? "bg-status-connected text-white" : "bg-status-offline text-white"}>
            {connections?.microsoft365?.configured ? "Configurado" : "Pendiente"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-id">Client ID</Label>
              <Input
                id="client-id"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={credentials.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                data-testid="input-client-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-id">Tenant ID</Label>
              <Input
                id="tenant-id"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={credentials.tenantId}
                onChange={(e) => handleInputChange('tenantId', e.target.value)}
                data-testid="input-tenant-id"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-secret">Client Secret {connections?.microsoft365?.config?.hasSecret && "(Ya configurado)"}</Label>
            <Input
              id="client-secret"
              type="password"
              placeholder="••••••••••••••••••••••••••••••••"
              value={credentials.clientSecret}
              onChange={(e) => handleInputChange('clientSecret', e.target.value)}
              data-testid="input-client-secret"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSaveCredentials}
              data-testid="button-save-microsoft"
              className="hover-elevate"
              disabled={saveConfigMutation.isPending}
            >
              {saveConfigMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Microsoft 365
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* OpenAI Configuration */}
      <Card className="hover-elevate">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <Zap className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">OpenAI API</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Clave para análisis de inteligencia artificial
            </p>
          </div>
          <Badge className={connections?.openai?.configured ? "bg-status-connected text-white" : "bg-status-offline text-white"}>
            {connections?.openai?.configured ? "Configurado" : "Pendiente"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key">API Key {connections?.openai?.config?.hasKey && "(Ya configurado)"}</Label>
            <Input
              id="openai-key"
              type="password"
              placeholder="sk-••••••••••••••••••••••••••••••••••••••••••••"
              value={credentials.openaiKey}
              onChange={(e) => handleInputChange('openaiKey', e.target.value)}
              data-testid="input-openai-key"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSaveCredentials}
              data-testid="button-save-openai"
              className="hover-elevate"
              disabled={saveConfigMutation.isPending}
            >
              {saveConfigMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar OpenAI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Configuration */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Configuración de Análisis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Parámetros para el procesamiento de datos
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="analysis-period">Período de Análisis (días)</Label>
              <Input
                id="analysis-period"
                type="number"
                placeholder="30"
                defaultValue="30"
                data-testid="input-analysis-period"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-size">Tamaño de Lote</Label>
              <Input
                id="batch-size"
                type="number"
                placeholder="100"
                defaultValue="100"
                data-testid="input-batch-size"
              />
            </div>
          </div>
          <Button 
            onClick={() => console.log('Guardando configuración de análisis...')}
            data-testid="button-save-analysis"
            className="hover-elevate"
          >
            Guardar Configuración
          </Button>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-status-warning bg-status-warning/5">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
          <Key className="w-5 h-5 text-status-warning" />
          <CardTitle className="text-lg font-semibold text-status-warning">
            Seguridad de Credenciales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">
            Todas las credenciales se almacenan de forma segura como variables de entorno. 
            Nunca se exponen en el código fuente y se utilizan únicamente para las conexiones 
            autorizadas a los servicios especificados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}