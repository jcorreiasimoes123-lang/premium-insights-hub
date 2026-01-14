import { PricingCard } from "./PricingCard";

const freeFeatures = [
  { name: "Até 3 projetos", included: true },
  { name: "Histórico de 7 dias", included: true },
  { name: "Relatórios básicos", included: true },
  { name: "2 integrações", included: true },
  { name: "Suporte por email", included: true },
  { name: "Histórico ilimitado", included: false },
  { name: "Relatórios avançados", included: false },
  { name: "Integrações ilimitadas", included: false },
];

const proFeatures = [
  { name: "Projetos ilimitados", included: true, highlight: true },
  { name: "Histórico ilimitado", included: true, highlight: true },
  { name: "Relatórios avançados + exportação", included: true, highlight: true },
  { name: "Integrações ilimitadas", included: true, highlight: true },
  { name: "API completa", included: true, highlight: true },
  { name: "Suporte prioritário 24/7", included: true },
  { name: "Backup automático", included: true },
  { name: "SSO & controles de equipe", included: true },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece grátis e faça upgrade quando precisar de mais poder. 
            Sem surpresas, cancele quando quiser.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Grátis"
            price="Grátis"
            description="Perfeito para começar e explorar os recursos básicos"
            features={freeFeatures}
            buttonText="Começar Grátis"
          />
          <PricingCard
            title="Pro"
            price="R$ 49"
            description="Para equipes que precisam de recursos avançados"
            features={proFeatures}
            isPro
            popular
            buttonText="Assinar Pro"
          />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Todos os planos incluem 14 dias de teste do Pro gratuitamente
        </p>
      </div>
    </section>
  );
}
