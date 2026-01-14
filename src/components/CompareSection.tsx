import { FeatureComparison } from "./FeatureComparison";

export function CompareSection() {
  return (
    <section id="funcionalidades" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Compara os planos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vê o que cada plano oferece e escolhe o ideal para ti
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <FeatureComparison />
        </div>
      </div>
    </section>
  );
}
