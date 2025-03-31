
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Customer, Preferences } from "@/types";
import { AlertCircle } from "lucide-react";

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
    outdoor: false,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    partySize?: string;
    preferences?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      phone?: string;
      partySize?: string;
      preferences?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (phone.length < 10) {
      newErrors.phone = "Telefone inválido";
    }

    if (partySize < 1) {
      newErrors.partySize = "Deve haver pelo menos 1 pessoa";
    }

    if (!preferences.indoor && !preferences.outdoor) {
      newErrors.preferences = "Selecione ao menos uma opção de acomodação";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Generate UUID using crypto API instead of uuid package
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name,
      phone,
      partySize,
      preferences,
      timestamp: Date.now(),
      status: "waiting",
      priority: preferences.pregnant || preferences.elderly || preferences.disabled || preferences.infant,
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
      outdoor: false,
    });
    setErrors({});
  };

  const togglePreference = (key: keyof Preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-blue-100">
      <h2 className="text-xl font-bold text-gastro-blue mb-6">Cadastrar na Fila</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gastro-gray mb-1" htmlFor="name">
            Nome Completo *
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome completo"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gastro-gray mb-1" htmlFor="phone">
            Telefone *
          </label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="DDD + número (apenas números)"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gastro-gray mb-1" htmlFor="partySize">
            Número de Pessoas *
          </label>
          <Input
            id="partySize"
            type="number"
            min={1}
            value={partySize}
            onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
            className={errors.partySize ? "border-red-500" : ""}
          />
          {errors.partySize && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.partySize}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gastro-gray mb-2">Preferências</h3>
          
          <div className="space-y-2">
            <div className="border-b pb-2">
              <h4 className="text-xs font-medium text-gastro-blue mb-2">Atendimento Prioritário</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pregnant" 
                    checked={preferences.pregnant}
                    onCheckedChange={() => togglePreference("pregnant")}
                  />
                  <label htmlFor="pregnant" className="text-sm text-gastro-gray">
                    Gestante
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="elderly" 
                    checked={preferences.elderly}
                    onCheckedChange={() => togglePreference("elderly")}
                  />
                  <label htmlFor="elderly" className="text-sm text-gastro-gray">
                    Idoso
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="disabled" 
                    checked={preferences.disabled}
                    onCheckedChange={() => togglePreference("disabled")}
                  />
                  <label htmlFor="disabled" className="text-sm text-gastro-gray">
                    PCD
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="infant" 
                    checked={preferences.infant}
                    onCheckedChange={() => togglePreference("infant")}
                  />
                  <label htmlFor="infant" className="text-sm text-gastro-gray">
                    Criança de colo
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gastro-blue mb-2">Acomodação *</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="indoor" 
                    checked={preferences.indoor}
                    onCheckedChange={() => togglePreference("indoor")}
                  />
                  <label htmlFor="indoor" className="text-sm text-gastro-gray">
                    Mesa interna
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="outdoor" 
                    checked={preferences.outdoor}
                    onCheckedChange={() => togglePreference("outdoor")}
                  />
                  <label htmlFor="outdoor" className="text-sm text-gastro-gray">
                    Mesa externa
                  </label>
                </div>
                {errors.preferences && (
                  <p className="text-red-500 text-sm mt-1 flex items-center col-span-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.preferences}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gastro-blue mb-2">Outros</h4>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="withDog" 
                  checked={preferences.withDog}
                  onCheckedChange={() => togglePreference("withDog")}
                />
                <label htmlFor="withDog" className="text-sm text-gastro-gray">
                  Com cachorro
                </label>
              </div>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gastro-orange hover:bg-orange-600 text-white py-6 mt-6"
        >
          Entrar na Fila
        </Button>
      </form>
    </div>
  );
};

export default RegistrationForm;
