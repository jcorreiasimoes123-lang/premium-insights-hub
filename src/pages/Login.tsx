import { useState } from "react";
import { Wallet, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login - redireciona para dashboard
    toast({
      title: "Sessão iniciada",
      description: "Bem-vindo de volta!",
    });
    
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        <div className="bg-card rounded-2xl p-8 card-shadow border border-border">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 rounded-lg gradient-bg">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Carteira PT</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Bem-vindo de volta</h1>
          <p className="text-muted-foreground mb-8">Entra na tua conta para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button variant="hero" size="lg" className="w-full" type="submit">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tens conta?{" "}
            <Link to="/registar" className="text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
