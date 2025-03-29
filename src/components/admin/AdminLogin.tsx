
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User } from "lucide-react";
import { mockAdminCredentials } from "@/utils/mockData";

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call with timeout
    setTimeout(() => {
      if (
        username === mockAdminCredentials.username &&
        password === mockAdminCredentials.password
      ) {
        onLogin();
      } else {
        setError("Usuário ou senha inválidos");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gastro-blue">Admin</h2>
        <p className="text-gastro-gray">4 Gastro Burger</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username" className="gastro-label">
            Usuário
          </Label>
          <div className="relative">
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="gastro-input pl-10"
              placeholder="Seu usuário"
              disabled={isLoading}
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gastro-gray" />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="gastro-label">
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="gastro-input pl-10"
              placeholder="Sua senha"
              disabled={isLoading}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gastro-gray" />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full btn-primary"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;
