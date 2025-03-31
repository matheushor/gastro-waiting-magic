
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Customer } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { User, Clock, Shield, AlertTriangle } from "lucide-react";

interface RegistrationFormProps {
  onRegister: (customer: Customer) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState<number>(1);
  const [preferences, setPreferences] = useState({
    pregnant: false,
    elderly: false,
    disabled: false,
    infant: false,
    withDog: false,
    indoor: false,
    outdoor: false,
  });

  const resetForm = () => {
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
      outdoor: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor, informe seu nome.");
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
      toast.error("Por favor, informe um telefone válido.");
      return;
    }

    // Previously we required either indoor or outdoor to be selected,
    // but now we're removing that requirement

    const newCustomer: Customer = {
      id: uuidv4(),
      name: name.trim(),
      phone: phone.trim().replace(/\D/g, ""),
      partySize,
      preferences,
      timestamp: Date.now(),
      status: "waiting",
      priority: preferences.pregnant || preferences.elderly || preferences.disabled || preferences.infant,
    };

    onRegister(newCustomer);
    resetForm();
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    
    // Format phone number: (99) 99999-9999
    let formattedValue = "";
    if (value.length <= 2) {
      formattedValue = value;
    } else if (value.length <= 7) {
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length <= 11) {
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else {
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
    }
    
    setPhone(formattedValue);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-blue-100">
      <div className="bg-gradient-to-r from-gastro-blue to-blue-600 rounded-t-lg p-4">
        <h2 className="text-xl font-bold text-white">Entrar na Fila</h2>
        <p className="text-blue-100">Preencha seus dados para entrar na fila de espera</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gastro-gray flex items-center">
              <User className="h-4 w-4 mr-2 text-gastro-blue" />
              Nome completo
            </Label>
            <Input
              id="name"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-blue-100 focus:border-gastro-blue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gastro-gray flex items-center">
              <User className="h-4 w-4 mr-2 text-gastro-blue" />
              Telefone
            </Label>
            <Input
              id="phone"
              placeholder="(99) 99999-9999"
              value={phone}
              onChange={handlePhoneInput}
              className="border-blue-100 focus:border-gastro-blue"
            />
            <p className="text-xs text-gastro-gray">
              Você receberá uma notificação quando sua vez chegar
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partySize" className="text-gastro-gray flex items-center">
              <User className="h-4 w-4 mr-2 text-gastro-blue" />
              Quantidade de pessoas
            </Label>
            <Select
              value={partySize.toString()}
              onValueChange={(value) => setPartySize(Number(value))}
            >
              <SelectTrigger className="border-blue-100 focus:border-gastro-blue">
                <SelectValue placeholder="Selecione a quantidade" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "pessoa" : "pessoas"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-gastro-blue font-medium mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2" /> 
              Preferências (Opcional)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="pregnant"
                  checked={preferences.pregnant}
                  onCheckedChange={(checked) => 
                    setPreferences({...preferences, pregnant: checked === true})
                  }
                />
                <Label htmlFor="pregnant" className="text-sm text-gastro-gray cursor-pointer">
                  Gestante
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="elderly"
                  checked={preferences.elderly}
                  onCheckedChange={(checked) => 
                    setPreferences({...preferences, elderly: checked === true})
                  }
                />
                <Label htmlFor="elderly" className="text-sm text-gastro-gray cursor-pointer">
                  Idoso
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="disabled"
                  checked={preferences.disabled}
                  onCheckedChange={(checked) => 
                    setPreferences({...preferences, disabled: checked === true})
                  }
                />
                <Label htmlFor="disabled" className="text-sm text-gastro-gray cursor-pointer">
                  PCD
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="infant"
                  checked={preferences.infant}
                  onCheckedChange={(checked) => 
                    setPreferences({...preferences, infant: checked === true})
                  }
                />
                <Label htmlFor="infant" className="text-sm text-gastro-gray cursor-pointer">
                  Criança de colo
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="withDog"
                  checked={preferences.withDog}
                  onCheckedChange={(checked) => 
                    setPreferences({...preferences, withDog: checked === true})
                  }
                />
                <Label htmlFor="withDog" className="text-sm text-gastro-gray cursor-pointer">
                  Com cachorro
                </Label>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-gastro-blue font-medium mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2" /> 
              Localização (Opcional)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="indoor"
                  checked={preferences.indoor}
                  onCheckedChange={(checked) => 
                    setPreferences({...preferences, indoor: checked === true})
                  }
                />
                <Label htmlFor="indoor" className="text-sm text-gastro-gray cursor-pointer">
                  Mesa interna
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="outdoor"
                  checked={preferences.outdoor}
                  onCheckedChange={(checked) => 
                    setPreferences({...preferences, outdoor: checked === true})
                  }
                />
                <Label htmlFor="outdoor" className="text-sm text-gastro-gray cursor-pointer">
                  Mesa externa
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={resetForm}
            className="w-full sm:w-auto"
          >
            Limpar
          </Button>
          <Button 
            type="submit" 
            className="w-full sm:w-auto bg-gastro-orange hover:bg-orange-600"
          >
            Entrar na Fila
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
