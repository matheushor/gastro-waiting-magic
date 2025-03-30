
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Customer, Preferences } from "@/types";
import { Label } from "@/components/ui/label";
import { User, Users, Heart, Shield, Home, Wind } from "lucide-react";

interface AdminRegistrationFormProps {
  onRegister: (customer: Customer) => void;
}

const AdminRegistrationForm: React.FC<AdminRegistrationFormProps> = ({ onRegister }) => {
  const [name, setName] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [preferences, setPreferences] = useState<Preferences>({
    pregnant: false,
    elderly: false,
    disabled: false,
    infant: false,
    withDog: false,
    indoor: true,
    outdoor: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Atualiza preferências quando "com cachorro" é selecionado
  React.useEffect(() => {
    if (preferences.withDog) {
      setPreferences(prev => ({
        ...prev,
        outdoor: true,
        indoor: false
      }));
    }
  }, [preferences.withDog]);

  // Garante que apenas um tipo de mesa está selecionado por vez
  React.useEffect(() => {
    if (preferences.indoor && preferences.outdoor) {
      setPreferences(prev => ({
        ...prev,
        outdoor: false
      }));
    }
  }, [preferences.indoor]);

  const handlePreferenceChange = (key: keyof Preferences) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, [key]: !prev[key] };
      
      // Se selecionar mesa interna, desmarca mesa externa
      if (key === 'indoor' && newPrefs.indoor) {
        newPrefs.outdoor = false;
      }
      // Se selecionar mesa externa, desmarca mesa interna
      else if (key === 'outdoor' && newPrefs.outdoor) {
        newPrefs.indoor = false;
      }
      
      return newPrefs;
    });
  };

  const handlePartySizeChange = (value: string) => {
    setPartySize(parseInt(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Por favor, informe o nome do cliente");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const hasPriority = preferences.pregnant || preferences.elderly || 
                         preferences.disabled || preferences.infant;
                         
      const newCustomer: Customer = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        // Usando número aleatório como telefone para clientes cadastrados pelo admin
        phone: `9${Math.floor(Math.random() * 90000000) + 10000000}`,
        partySize,
        preferences,
        timestamp: Date.now(),
        status: "waiting",
        priority: hasPriority,
      };
      
      onRegister(newCustomer);
      toast.success("Cliente adicionado com sucesso!");
      
      setName("");
      setPartySize(1);
      setPreferences({
        pregnant: false,
        elderly: false,
        disabled: false,
        infant: false,
        withDog: false,
        indoor: true,
        outdoor: false,
      });
    } catch (error) {
      console.error("Erro ao registrar cliente:", error);
      toast.error("Erro ao registrar cliente. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-blue-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gastro-blue to-blue-600 text-white p-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="h-5 w-5" />
          Adicionar Cliente
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <Label htmlFor="admin-name" className="text-gastro-gray font-semibold flex items-center gap-1">
            <User className="h-4 w-4 text-gastro-blue" />
            Nome do cliente
          </Label>
          <Input
            id="admin-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 border-2 border-blue-100 focus:border-gastro-blue"
            placeholder="Digite o nome do cliente"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="admin-partySize" className="text-gastro-gray font-semibold flex items-center gap-1">
            <Users className="h-4 w-4 text-gastro-blue" />
            Número de pessoas
          </Label>
          <Select onValueChange={handlePartySizeChange} defaultValue="1">
            <SelectTrigger className="w-full mt-1 border-2 border-blue-100 focus:border-gastro-blue">
              <SelectValue placeholder="Selecione o número de pessoas" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(10)].map((_, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {i + 1} {i + 1 > 1 ? 'pessoas' : 'pessoa'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-gastro-gray font-semibold mb-2">Preferências Prioritárias</p>
            <div className="space-y-2 bg-blue-50 p-2 rounded-md">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-pregnant"
                  checked={preferences.pregnant}
                  onCheckedChange={() => handlePreferenceChange("pregnant")}
                  disabled={isLoading}
                  className="border-gastro-blue data-[state=checked]:bg-gastro-orange"
                />
                <label
                  htmlFor="admin-pregnant"
                  className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Heart className="h-4 w-4 text-gastro-orange" />
                  Gestante
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-elderly"
                  checked={preferences.elderly}
                  onCheckedChange={() => handlePreferenceChange("elderly")}
                  disabled={isLoading}
                  className="border-gastro-blue data-[state=checked]:bg-gastro-orange"
                />
                <label
                  htmlFor="admin-elderly"
                  className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                >
                  <User className="h-4 w-4 text-gastro-orange" />
                  Idoso
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-disabled"
                  checked={preferences.disabled}
                  onCheckedChange={() => handlePreferenceChange("disabled")}
                  disabled={isLoading}
                  className="border-gastro-blue data-[state=checked]:bg-gastro-orange"
                />
                <label
                  htmlFor="admin-disabled"
                  className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Heart className="h-4 w-4 text-gastro-orange" />
                  PCD
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-infant"
                  checked={preferences.infant}
                  onCheckedChange={() => handlePreferenceChange("infant")}
                  disabled={isLoading}
                  className="border-gastro-blue data-[state=checked]:bg-gastro-orange"
                />
                <label
                  htmlFor="admin-infant"
                  className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                >
                  <User className="h-4 w-4 text-gastro-orange" />
                  Criança de colo
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-gastro-gray font-semibold mb-2">Outras Preferências</p>
            <div className="space-y-2 bg-blue-50 p-2 rounded-md">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-withDog"
                  checked={preferences.withDog}
                  onCheckedChange={() => handlePreferenceChange("withDog")}
                  disabled={isLoading}
                  className="border-gastro-blue data-[state=checked]:bg-gastro-blue"
                />
                <label
                  htmlFor="admin-withDog"
                  className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Shield className="h-4 w-4 text-gastro-blue" />
                  Com cachorro
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-indoor"
                  checked={preferences.indoor}
                  onCheckedChange={() => handlePreferenceChange("indoor")}
                  disabled={isLoading || preferences.withDog}
                  className="border-gastro-blue data-[state=checked]:bg-gastro-blue"
                />
                <label
                  htmlFor="admin-indoor"
                  className={`text-sm font-medium ${preferences.withDog ? 'opacity-50' : 'opacity-100'} flex items-center gap-1 cursor-pointer`}
                >
                  <Home className="h-4 w-4 text-gastro-blue" />
                  Mesa interna
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-outdoor"
                  checked={preferences.outdoor}
                  onCheckedChange={() => handlePreferenceChange("outdoor")}
                  disabled={isLoading || preferences.withDog}
                  className="border-gastro-blue data-[state=checked]:bg-gastro-blue"
                />
                <label
                  htmlFor="admin-outdoor"
                  className={`text-sm font-medium ${preferences.withDog ? 'opacity-50' : 'opacity-100'} flex items-center gap-1 cursor-pointer`}
                >
                  <Wind className="h-4 w-4 text-gastro-blue" />
                  Mesa externa
                </label>
              </div>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gastro-orange hover:bg-orange-600 text-white font-bold py-2" 
          disabled={isLoading}
        >
          {isLoading ? "Processando..." : "Adicionar Cliente"}
        </Button>
      </form>
    </div>
  );
};

export default AdminRegistrationForm;
