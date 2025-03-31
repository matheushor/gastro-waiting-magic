
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Customer, Preferences } from "@/types";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Shield, Heart, User, Clock, Users, Home, Wind } from "lucide-react";

interface RegistrationFormProps {
  onRegister: (customer: Customer) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [preferences, setPreferences] = useState<Preferences>({
    pregnant: false,
    elderly: false,
    disabled: false,
    infant: false,
    withDog: false,
    indoor: false,
    outdoor: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Por favor, informe seu nome");
      return;
    }
    
    if (!phone.trim()) {
      toast.error("Por favor, informe seu telefone para contato");
      return;
    }
    
    if (partySize < 1) {
      toast.error("O número de pessoas deve ser pelo menos 1");
      return;
    }

    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
      partySize,
      preferences,
      timestamp: Date.now(),
      status: "waiting",
      priority: preferences.pregnant || preferences.elderly || preferences.disabled || preferences.infant
    };

    onRegister(newCustomer);

    // Reset form
    setName("");
    setPhone("");
    setPartySize(1);
    setPreferences({
      pregnant: false,
      elderly: false,
      disabled: false,
      infant: false,
      withDog: false,
      indoor: false,
      outdoor: false
    });
  };

  const handlePreferenceChange = (key: keyof Preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name" className="block mb-2 text-sm font-medium text-gastro-gray">
            Nome
          </Label>
          <Input
            id="name"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-gastro-lightGray"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="block mb-2 text-sm font-medium text-gastro-gray">
            Telefone
          </Label>
          <Input
            id="phone"
            placeholder="DDD + Número (apenas números)"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            className="border-gastro-lightGray"
          />
          <p className="mt-1 text-xs text-gastro-gray">
            Usaremos para avisar quando sua mesa estiver pronta
          </p>
        </div>

        <div>
          <Label htmlFor="partySize" className="block mb-2 text-sm font-medium text-gastro-gray">
            Número de pessoas
          </Label>
          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPartySize(Math.max(1, partySize - 1))}
              className="border-gastro-blue text-gastro-blue"
            >
              -
            </Button>
            <div className="w-12 text-center font-semibold">{partySize}</div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPartySize(partySize + 1)}
              className="border-gastro-blue text-gastro-blue"
            >
              +
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="block text-sm font-medium text-gastro-blue flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Necessidades específicas
          </Label>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="pregnant" 
                checked={preferences.pregnant}
                onCheckedChange={() => handlePreferenceChange("pregnant")}
              />
              <Label htmlFor="pregnant" className="text-sm cursor-pointer flex items-center">
                <Heart className="h-3 w-3 mr-1 text-red-500" />
                Gestante
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="elderly" 
                checked={preferences.elderly}
                onCheckedChange={() => handlePreferenceChange("elderly")}
              />
              <Label htmlFor="elderly" className="text-sm cursor-pointer flex items-center">
                <User className="h-3 w-3 mr-1 text-blue-500" />
                Idoso
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="disabled" 
                checked={preferences.disabled}
                onCheckedChange={() => handlePreferenceChange("disabled")}
              />
              <Label htmlFor="disabled" className="text-sm cursor-pointer flex items-center">
                <Heart className="h-3 w-3 mr-1 text-red-500" />
                PCD
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="infant" 
                checked={preferences.infant}
                onCheckedChange={() => handlePreferenceChange("infant")}
              />
              <Label htmlFor="infant" className="text-sm cursor-pointer flex items-center">
                <User className="h-3 w-3 mr-1 text-blue-500" />
                Criança de colo
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="withDog" 
                checked={preferences.withDog}
                onCheckedChange={() => handlePreferenceChange("withDog")}
              />
              <Label htmlFor="withDog" className="text-sm cursor-pointer">
                Com cachorro
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="block text-sm font-medium text-gastro-blue flex items-center">
            <Home className="h-4 w-4 mr-2" />
            Preferência de mesa
          </Label>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="indoor" 
                checked={preferences.indoor}
                onCheckedChange={() => handlePreferenceChange("indoor")}
              />
              <Label htmlFor="indoor" className="text-sm cursor-pointer flex items-center">
                <Home className="h-3 w-3 mr-1 text-green-600" />
                Mesa interna
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="outdoor" 
                checked={preferences.outdoor}
                onCheckedChange={() => handlePreferenceChange("outdoor")}
              />
              <Label htmlFor="outdoor" className="text-sm cursor-pointer flex items-center">
                <Wind className="h-3 w-3 mr-1 text-green-600" />
                Mesa externa
              </Label>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full bg-gastro-orange hover:bg-orange-600 text-white"
          >
            Entrar na Fila
          </Button>
        </div>
        
        <div className="text-xs text-gastro-gray text-center">
          <p>Ao entrar na fila, você receberá uma notificação quando sua vez chegar.</p>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
