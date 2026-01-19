import { AlertTriangle } from "lucide-react";

const TestBanner = () => {
  return (
    <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-8 px-4">
      <div className="container mx-auto flex items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-white animate-pulse" />
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-widest">
            🚧 MODO DE TESTES 🚧
          </h2>
          <p className="text-white/90 text-lg md:text-xl mt-2">
            Este é um banner gigante de testes - ambiente de desenvolvimento
          </p>
        </div>
        <AlertTriangle className="h-12 w-12 text-white animate-pulse" />
      </div>
    </div>
  );
};

export default TestBanner;
