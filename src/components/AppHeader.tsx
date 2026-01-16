import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { mockUser } from "@/data/mockData";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-2 rounded-lg gradient-bg">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Carteira PT</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link 
            to="/dashboard" 
            className={`text-sm transition-colors ${
              isActive("/dashboard") 
                ? "font-medium text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/despesas" 
            className={`text-sm transition-colors ${
              isActive("/despesas") 
                ? "font-medium text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Despesas
          </Link>
          <Link 
            to="/subscricoes" 
            className={`text-sm transition-colors ${
              isActive("/subscricoes") 
                ? "font-medium text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Subscrições
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{mockUser.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
