import { PricingCard } from "./PricingCard";

const freeFeatures = [
  { name: "Até 50 despesas/mês", included: true },
  { name: "5 subscrições", included: true },
  { name: "Histórico de 30 dias", included: true },
  { name: "Relatórios básicos", included: true },
  { name: "Exportar para CSV", included: false },
  { name: "Histórico ilimitado", included: false },
  { name: "Relatórios avançados", included: false },
  { name: "Integrações bancárias", included: false },
];

const proFeatures = [
  { name: "Despesas ilimitadas", included: true, highlight: true },
  { name: "Subscrições ilimitadas", included: true, highlight: true },
  { name: "Histórico ilimitado", included: true, highlight: true },
  { name: "Relatórios avançados + gráficos", included: true, highlight: true },
  { name: "Exportar PDF, CSV, Excel", included: true },
  { name: "Integrações bancárias", included: true },
  { name: "Alertas de renovação", included: true },
  { name: "Suporte prioritário", included: true },
];

export function PricingSection() {
  return (
    <section id="planos" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planos simples e transparentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Começa grátis e faz upgrade quando precisares de mais funcionalidades.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Grátis"
            price="€0"
            description="Ideal para quem quer começar a organizar as finanças"
            features={freeFeatures}
            buttonText="Começar Grátis"
          />
          <PricingCard
            title="Pro"
            price="€4.99"
            description="Para quem quer controlo total sobre despesas e subscrições"
            features={proFeatures}
            isPro
            popular
            buttonText="Experimentar Pro"
          />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          14 dias de teste gratuito do Pro. Cancela quando quiseres.
        </p>
      </div>
    </section>
  );
}
