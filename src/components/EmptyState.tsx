import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="icon-container-lg bg-muted mb-5">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[280px] mb-5">
        {description}
      </p>
      {actionLabel && actionLink && (
        <Link to={actionLink}>
          <Button variant="outline" size="sm">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
