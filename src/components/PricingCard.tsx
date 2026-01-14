import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Feature {
  name: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: Feature[];
  isPro?: boolean;
  buttonText: string;
  popular?: boolean;
}

export function PricingCard({
  title,
  price,
  period = "/mês",
  description,
  features,
  isPro = false,
  buttonText,
  popular = false,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl p-8 card-shadow transition-all duration-300 hover:-translate-y-1",
        isPro ? "pro-card-gradient border-2 border-primary/20" : "bg-card border border-border"
      )}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="gradient-bg px-4 py-1.5 rounded-full text-sm font-medium text-primary-foreground shadow-lg">
            Mais Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className={cn("text-xl font-semibold mb-2", isPro && "gradient-text")}>
          {title}
        </h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Grátis" && (
            <span className="text-muted-foreground">{period}</span>
          )}
        </div>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {feature.included ? (
              <div className={cn(
                "rounded-full p-1 mt-0.5",
                feature.highlight ? "bg-primary/10" : "bg-accent/10"
              )}>
                <Check className={cn(
                  "w-4 h-4",
                  feature.highlight ? "text-primary" : "text-accent"
                )} />
              </div>
            ) : (
              <div className="rounded-full p-1 mt-0.5 bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <span className={cn(
              "text-sm",
              !feature.included && "text-muted-foreground"
            )}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <Button
        variant={isPro ? "hero" : "hero-outline"}
        size="lg"
        className="w-full"
      >
        {buttonText}
      </Button>
    </div>
  );
}
