import { Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { mockUser } from "@/data/mockData";

const navLinks = [
  { path: "/dashboard", label: "Painel" },
  { path: "/despesas", label: "Despesas" },
  { path: "/subscricoes", label: "Subscrições" },
];

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="icon-container-sm gradient-bg">
            <Wallet className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">Carteira PT</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${isActive(path)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {mockUser.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
