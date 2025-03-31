
import React, { useState } from "react";
import { Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface AdminRegistrationFormProps {
  onRegister: (customer: Customer) => void;
}

const AdminRegistrationForm: React.FC<AdminRegistrationFormProps> = ({ onRegister }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error("O nome do cliente é obrigatório");
      return;
    }

    if (!phone) {
      toast.error("O telefone do cliente é obrigatório");
      return;
    }

    const newCustomer: Customer = {
      id: uuidv4(),
      name,
      phone: phone.replace(/\D/g, ""),
      partySize,
      preferences,
      timestamp: Date.now(),
      status: "waiting",
      priority: preferences.pregnant || preferences.elderly || preferences.disabled || preferences.infant,
    };

    onRegister(newCustomer);
    
    // Reset the form
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Cliente</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome completo"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={handlePhoneInput}
            placeholder="(99) 99999-9999"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="partySize">Quantidade de pessoas</Label>
          <Select
            value={partySize.toString()}
            onValueChange={(value) => setPartySize(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'pessoa' : 'pessoas'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Preferências</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="admin-pregnant"
                checked={preferences.pregnant}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, pregnant: checked === true})
                }
              />
              <Label htmlFor="admin-pregnant">Gestante</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="admin-elderly"
                checked={preferences.elderly}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, elderly: checked === true})
                }
              />
              <Label htmlFor="admin-elderly">Idoso</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="admin-disabled"
                checked={preferences.disabled}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, disabled: checked === true})
                }
              />
              <Label htmlFor="admin-disabled">PCD</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="admin-infant"
                checked={preferences.infant}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, infant: checked === true})
                }
              />
              <Label htmlFor="admin-infant">Criança de colo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="admin-withDog"
                checked={preferences.withDog}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, withDog: checked === true})
                }
              />
              <Label htmlFor="admin-withDog">Com cachorro</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="admin-indoor"
                checked={preferences.indoor}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, indoor: checked === true})
                }
              />
              <Label htmlFor="admin-indoor">Mesa interna</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="admin-outdoor"
                checked={preferences.outdoor}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, outdoor: checked === true})
                }
              />
              <Label htmlFor="admin-outdoor">Mesa externa</Label>
            </div>
          </div>
        </div>
        
        <Button type="submit" className="w-full">
          Cadastrar Cliente
        </Button>
      </form>
    </div>
  );
};

export default AdminRegistrationForm;
