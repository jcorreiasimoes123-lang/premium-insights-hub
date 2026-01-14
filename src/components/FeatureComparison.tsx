import { Check, X, Infinity, Clock, BarChart3, Plug, Shield, Headphones } from "lucide-react";

const features = [
  {
    icon: Clock,
    name: "Histórico de dados",
    free: "Últimos 7 dias",
    pro: "Ilimitado",
    proHighlight: true,
  },
  {
    icon: BarChart3,
    name: "Relatórios",
    free: "Básicos",
    pro: "Avançados + Exportação",
    proHighlight: true,
  },
  {
    icon: Plug,
    name: "Integrações",
    free: "2 apps",
    pro: "Ilimitadas",
    proHighlight: true,
  },
  {
    icon: Shield,
    name: "Backup automático",
    free: false,
    pro: true,
  },
  {
    icon: Headphones,
    name: "Suporte prioritário",
    free: false,
    pro: true,
  },
];

export function FeatureComparison() {
  return (
    <div className="w-full">
      <div className="hidden md:grid grid-cols-3 gap-4 mb-4 px-6">
        <div className="text-sm font-medium text-muted-foreground">Recurso</div>
        <div className="text-center text-sm font-medium text-muted-foreground">Grátis</div>
        <div className="text-center text-sm font-medium gradient-text">Pro</div>
      </div>

      <div className="space-y-2">
        {features.map((feature, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 md:px-6 rounded-xl bg-card/50 hover:bg-card transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">{feature.name}</span>
            </div>

            <div className="flex items-center justify-between md:justify-center gap-2">
              <span className="text-sm text-muted-foreground md:hidden">Grátis:</span>
              {typeof feature.free === "boolean" ? (
                feature.free ? (
                  <Check className="w-5 h-5 text-accent" />
                ) : (
                  <X className="w-5 h-5 text-muted-foreground/50" />
                )
              ) : (
                <span className="text-sm text-muted-foreground">{feature.free}</span>
              )}
            </div>

            <div className="flex items-center justify-between md:justify-center gap-2">
              <span className="text-sm text-muted-foreground md:hidden">Pro:</span>
              {typeof feature.pro === "boolean" ? (
                feature.pro ? (
                  <div className="flex items-center gap-1">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                ) : (
                  <X className="w-5 h-5 text-muted-foreground/50" />
                )
              ) : (
                <span className={feature.proHighlight ? "text-sm font-medium gradient-text" : "text-sm"}>
                  {feature.pro}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
