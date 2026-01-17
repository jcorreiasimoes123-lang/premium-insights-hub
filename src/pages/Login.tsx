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

    toast({
      title: "Sessão iniciada",
      description: "Bem-vindo de volta!",
    });

    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-sm">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        {/* Card */}
        <div className="card-base p-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="icon-container-sm gradient-bg">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Carteira PT</span>
          </div>

          <h1 className="text-xl font-bold mb-1">Bem-vindo de volta</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Entra na tua conta para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">
                Palavra-passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10"
              />
            </div>

            <Button className="w-full" type="submit">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
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
