import { useState } from 'react';
import { useCodes, type CodeRecord } from '@/context/CodeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Copy, CopyCheck, BookText, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { generateLegendItems } from '@/lib/codeUtils';
import { useIsMobile } from '@/hooks/use-mobile';

const LegendDialogContent = ({ code, contratantes }: { code: string, contratantes: { value: string, label: string }[] }) => (
  <DialogContent className="sm:max-w-[625px]">
    <DialogHeader>
      <DialogTitle>Legenda do Código</DialogTitle>
    </DialogHeader>
    <p className="font-mono text-sm pt-2 break-all">{code}</p>
    <div className="space-y-1 text-sm pt-4">
      {generateLegendItems(code, contratantes).map((item, index) => (
        <p key={index}>
          <span className="font-semibold">{item.title}:</span> {item.text}
        </p>
      ))}
    </div>
  </DialogContent>
);

export function CodeListPage() {
  const { codes, deleteCode, codeOptions } = useCodes();
  const { toast } = useToast();
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();

  const handleCopy = (textToCopy: string, id: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied({ [id]: true });
    toast({
      title: "Copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(prevState => ({ ...prevState, [id]: false })), 2000);
  };

  const handleDelete = async (codeId: string, codeName: string) => {
    try {
      await deleteCode(codeId);
      toast({
        title: "Código excluído!",
        description: `O código "${codeName}" foi excluído com sucesso. O número pode ser reutilizado.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o código. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Lista de Códigos Salvos</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="space-y-4">
              {codes.length > 0 ? (
                codes.map((record: CodeRecord) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                         <div className="flex-1 min-w-0">
                           <CardTitle className="text-lg leading-tight break-words">{record.name}</CardTitle>
                           <p className="text-sm text-muted-foreground pt-1">
                             Por: {record.user_name} • {record.createdAt.toLocaleDateString('pt-BR')}
                           </p>
                         </div>
                        <div className="flex items-center shrink-0 ml-2 space-x-1">
                           <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <BookText className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <LegendDialogContent code={record.code} contratantes={codeOptions.contratantes} />
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => handleCopy(record.code, record.id)}>
                            {copied[record.id] ? <CopyCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o código "{record.name}"? 
                                  Esta ação não pode ser desfeita. O número {record.code.split('-')[8]} ficará disponível para reutilização.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(record.id, record.name)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <code className="font-mono text-sm break-all">{record.code}</code>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="h-24 text-center flex items-center justify-center">
                  Nenhum código gerado ainda.
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                   <TableRow>
                     <TableHead>Nome</TableHead>
                     <TableHead>Código</TableHead>
                     <TableHead>Criado por</TableHead>
                     <TableHead>Data de Criação</TableHead>
                     <TableHead>Legenda</TableHead>
                     <TableHead className="text-right">Ações</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.length > 0 ? (
                    codes.map((record: CodeRecord) => (
                       <TableRow key={record.id}>
                         <TableCell className="font-medium">{record.name}</TableCell>
                         <TableCell><code className="font-mono text-sm">{record.code}</code></TableCell>
                         <TableCell className="text-sm text-muted-foreground">{record.user_name}</TableCell>
                         <TableCell>{record.createdAt.toLocaleDateString('pt-BR')}</TableCell>
                         <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <BookText className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <LegendDialogContent code={record.code} contratantes={codeOptions.contratantes} />
                          </Dialog>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleCopy(record.code, record.id)}>
                              {copied[record.id] ? <CopyCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o código "{record.name}"? 
                                    Esta ação não pode ser desfeita. O número {record.code.split('-')[8]} ficará disponível para reutilização.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(record.id, record.name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                       <TableCell colSpan={6} className="h-24 text-center">
                         Nenhum código gerado ainda.
                       </TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
