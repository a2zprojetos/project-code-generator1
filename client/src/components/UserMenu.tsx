import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export function UserMenu() {
  const { user, profile, signOut, generateInvitationToken } = useAuth();
  const { toast } = useToast();
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
  };

  const handleGenerateToken = async () => {
    setIsGeneratingToken(true);
    try {
      const { token, error } = await generateInvitationToken();
      
      if (error) {
        toast({
          title: "Erro ao gerar token",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setGeneratedToken(token);
        toast({
          title: "Token gerado com sucesso!",
          description: "O token foi gerado e é válido por 30 dias."
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Token copiado para a área de transferência."
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full group hover:shadow-lg transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <User className="h-5 w-5" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.name || user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {profile?.role && (
              <Badge variant={getRoleBadgeVariant(profile.role)} className="w-fit mt-1">
                {profile.role}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {profile?.role === 'admin' && (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Shield className="mr-2 h-4 w-4" />
                  Gerar Token de Convite
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gerar Token de Convite</DialogTitle>
                  <DialogDescription>
                    Gere um token para permitir que outras pessoas se cadastrem no sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Button 
                    onClick={handleGenerateToken}
                    disabled={isGeneratingToken}
                    className="w-full"
                  >
                    {isGeneratingToken ? "Gerando..." : "Gerar Novo Token"}
                  </Button>
                  
                  {generatedToken && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Token gerado:</p>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                          {generatedToken}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(generatedToken)}
                        >
                          Copiar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Este token é válido por 30 dias e pode ser usado apenas uma vez.
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}