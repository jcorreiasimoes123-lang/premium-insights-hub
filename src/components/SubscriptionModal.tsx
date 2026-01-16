import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { type Subscription, subscriptionCategories } from "@/data/mockData";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "O nome é obrigatório")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  amount: z
    .number({ invalid_type_error: "O valor é obrigatório" })
    .positive("O valor deve ser maior que 0"),
  renewalDate: z.date({ required_error: "A data de renovação é obrigatória" }),
  status: z.enum(["active", "paused"]),
  includeInTotal: z.boolean(),
  category: z.string().min(1, "A categoria é obrigatória"),
});

type FormData = z.infer<typeof formSchema>;

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription;
  onSave: (data: Omit<Subscription, "id">) => void;
}

const SubscriptionModal = ({
  open,
  onOpenChange,
  subscription,
  onSave,
}: SubscriptionModalProps) => {
  const isEditing = !!subscription;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      renewalDate: new Date(),
      status: "active",
      includeInTotal: true,
      category: subscriptionCategories[0],
    },
  });

  useEffect(() => {
    if (subscription) {
      form.reset({
        name: subscription.name,
        amount: subscription.amount,
        renewalDate: subscription.renewalDate,
        status: subscription.status,
        includeInTotal: subscription.includeInTotal,
        category: subscription.category,
      });
    } else {
      form.reset({
        name: "",
        amount: 0,
        renewalDate: new Date(),
        status: "active",
        includeInTotal: true,
        category: subscriptionCategories[0],
      });
    }
  }, [subscription, form, open]);

  const onSubmit = (data: FormData) => {
    onSave({
      name: data.name,
      amount: data.amount,
      renewalDate: data.renewalDate,
      status: data.status,
      includeInTotal: data.includeInTotal,
      category: data.category,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Subscrição" : "Nova Subscrição"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Netflix, Spotify..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valor mensal */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor mensal (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data de renovação */}
            <FormField
              control={form.control}
              name="renewalDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de renovação</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: pt })
                          ) : (
                            <span>Escolhe uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleciona o estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="paused">Pausada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleciona a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subscriptionCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Incluir no total */}
            <FormField
              control={form.control}
              name="includeInTotal"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Incluir no total mensal
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Incluir esta subscrição no cálculo do total
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="hero">
                {isEditing ? "Guardar Alterações" : "Adicionar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
