import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Calendar,
  CheckCircle,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
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
  getTotalSubscriptions,
  formatCurrency,
  formatDate,
  type Subscription,
} from "@/data/mockData";

const SUBSCRIPTIONS_KEY = "carteira-pt-subscriptions";

const Subscricoes = () => {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<
    Subscription | undefined
  >();
  const [deletingSubscription, setDeletingSubscription] = useState<
    Subscription | undefined
  >();

  useEffect(() => {
    const saved = localStorage.getItem(SUBSCRIPTIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSubscriptions(
        parsed.map((s: any) => ({ ...s, renewalDate: new Date(s.renewalDate) }))
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  }, [subscriptions]);

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

    setSubscriptions((prev) =>
      prev.filter((s) => s.id !== deletingSubscription.id)
    );
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

      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1>Subscrições</h1>
            <p className="text-muted-foreground mt-1">
              Gere as tuas subscrições SaaS e serviços
            </p>
          </div>
          <Button onClick={handleOpenNewModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Nova Subscrição
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="icon-container-sm"
                style={{ background: "hsl(var(--accent) / 0.1)" }}
              >
                <CreditCard
                  className="w-4 h-4"
                  style={{ color: "hsl(var(--accent))" }}
                />
              </div>
              <span className="stat-label">Custo mensal total</span>
            </div>
            <p className="stat-value">{formatCurrency(totalSubscriptions)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(totalSubscriptions * 12)} /ano
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="icon-container-sm"
                style={{ background: "hsl(var(--success) / 0.1)" }}
              >
                <CheckCircle
                  className="w-4 h-4"
                  style={{ color: "hsl(var(--success))" }}
                />
              </div>
              <span className="stat-label">Subscrições ativas</span>
            </div>
            <p className="stat-value">{activeCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              de {subscriptions.length} total
            </p>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="card-base overflow-hidden">
          <div className="section-header">
            <h2>As tuas Subscrições</h2>
          </div>
          <div className="divide-y divide-border">
            {subscriptions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="icon-container-lg bg-muted mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">Ainda não tens subscrições.</p>
                <p className="text-sm text-muted-foreground">
                  Clica em "Nova Subscrição" para começar.
                </p>
              </div>
            ) : (
              subscriptions.map((subscription) => (
                <div key={subscription.id} className="list-item-interactive">
                  <div className="flex items-center gap-3">
                    <div className="icon-container-md bg-primary/10">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{subscription.name}</p>
                        {subscription.includeInTotal && (
                          <span className="badge-primary text-[10px]">
                            Incluído no total
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="badge-muted">{subscription.category}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Renova {formatDate(subscription.renewalDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {subscription.status === "active" ? (
                      <span className="badge-success">Ativa</span>
                    ) : (
                      <span className="badge-muted">Pausada</span>
                    )}
                    <div className="text-right min-w-[90px]">
                      <span className="font-bold">
                        {formatCurrency(subscription.amount)}
                      </span>
                      <p className="text-xs text-muted-foreground">/mês</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleOpenEditModal(subscription)}
                        >
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

      <SubscriptionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        subscription={editingSubscription}
        onSave={handleSaveSubscription}
      />

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
