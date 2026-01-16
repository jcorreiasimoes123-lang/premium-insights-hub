import { useState } from "react";
import { CreditCard, Plus, Calendar, CheckCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppHeader from "@/components/AppHeader";
import SubscriptionModal from "@/components/SubscriptionModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
  mockSubscriptions as initialSubscriptions,
  getTotalSubscriptions,
  formatCurrency,
  formatDate,
  type Subscription,
} from "@/data/mockData";

const Subscricoes = () => {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>();
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | undefined>();

  const totalSubscriptions = getTotalSubscriptions(subscriptions);
  const activeCount = subscriptions.filter((s) => s.status === "active").length;

  const handleOpenNewModal = () => {
    setEditingSubscription(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleSaveSubscription = (data: Omit<Subscription, "id">) => {
    if (editingSubscription) {
      // Editar existente
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === editingSubscription.id ? { ...data, id: s.id } : s
        )
      );
      toast({
        title: "Subscrição atualizada",
        description: `"${data.name}" foi atualizada com sucesso.`,
      });
    } else {
      // Criar nova
      const newSubscription: Subscription = {
        ...data,
        id: `sub-${Date.now()}`,
      };
      setSubscriptions((prev) => [...prev, newSubscription]);
      toast({
        title: "Subscrição adicionada",
        description: `"${data.name}" foi adicionada com sucesso.`,
      });
    }
    setEditingSubscription(undefined);
  };

  const handleDeleteSubscription = () => {
    if (!deletingSubscription) return;
    
    setSubscriptions((prev) => prev.filter((s) => s.id !== deletingSubscription.id));
    toast({
      title: "Subscrição eliminada",
      description: `"${deletingSubscription.name}" foi eliminada.`,
      variant: "destructive",
    });
    setDeletingSubscription(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Toaster />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subscrições</h1>
            <p className="text-muted-foreground">Gere as tuas subscrições SaaS e serviços</p>
          </div>
          <Button variant="hero" onClick={handleOpenNewModal}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Subscrição
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <span className="text-muted-foreground">Custo mensal total</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalSubscriptions)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatCurrency(totalSubscriptions * 12)} /ano
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-muted-foreground">Subscrições ativas</span>
            </div>
            <p className="text-3xl font-bold">{activeCount}</p>
            <p className="text-sm text-muted-foreground mt-1">
              de {subscriptions.length} total
            </p>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">As tuas Subscrições</h2>
          </div>
          <div className="divide-y divide-border">
            {subscriptions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ainda não tens subscrições.</p>
                <p className="text-sm">Clica em "Nova Subscrição" para começar.</p>
              </div>
            ) : (
              subscriptions.map((subscription) => (
                <div key={subscription.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{subscription.name}</p>
                        {subscription.includeInTotal && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            Incluído no total
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {subscription.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Renova {formatDate(subscription.renewalDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {subscription.status === "active" ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                        Ativa
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                        Pausada
                      </span>
                    )}
                    <div className="text-right min-w-[100px]">
                      <span className="font-bold text-lg">{formatCurrency(subscription.amount)}</span>
                      <p className="text-xs text-muted-foreground">/mês</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEditModal(subscription)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeletingSubscription(subscription)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal para criar/editar */}
      <SubscriptionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        subscription={editingSubscription}
        onSave={handleSaveSubscription}
      />

      {/* Dialog de confirmação para eliminar */}
      <DeleteConfirmDialog
        open={!!deletingSubscription}
        onConfirm={handleDeleteSubscription}
        onCancel={() => setDeletingSubscription(undefined)}
        title="Eliminar subscrição?"
        description={`Tens a certeza que queres eliminar "${deletingSubscription?.name}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default Subscricoes;
