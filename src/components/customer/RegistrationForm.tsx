
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Customer, Preferences } from "@/types";
import { getCurrentPosition, isWithinRadius, RESTAURANT_LOCATION } from "@/utils/geoUtils";
import { Label } from "@/components/ui/label";
import { AlertCircle, MapPin, User, Users, Heart, Shield, Home, Wind } from "lucide-react";

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
    indoor: true,
    outdoor: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [bypassGeolocation, setBypassGeolocation] = useState(false);

  // Atualiza preferências quando "com cachorro" é selecionado
  useEffect(() => {
    if (preferences.withDog) {
      setPreferences(prev => ({
        ...prev,
        outdoor: true,
        indoor: false
      }));
    }
  }, [preferences.withDog]);

  // Garante que apenas um tipo de mesa está selecionado por vez
  useEffect(() => {
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      setPhone(value);
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return "";
    if (phone.length <= 2) return phone;
    if (phone.length <= 6) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  };

  const handlePartySizeChange = (value: string) => {
    setPartySize(parseInt(value));
  };

  const toggleBypassGeolocation = () => {
    setBypassGeolocation(!bypassGeolocation);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!name.trim()) {
      setError("Por favor, informe seu nome");
      setIsLoading(false);
      return;
    }
    
    if (phone.length < 10) {
      setError("Telefone inválido. Informe DDD + número");
      setIsLoading(false);
      return;
    }
    
    try {
      let isNearby = bypassGeolocation;
      
      if (!bypassGeolocation) {
        const position = await getCurrentPosition();
        isNearby = isWithinRadius(
          position.coords.latitude,
          position.coords.longitude,
          RESTAURANT_LOCATION.lat,
          RESTAURANT_LOCATION.lng,
          RESTAURANT_LOCATION.radius
        );
      }
      
      if (isNearby || bypassGeolocation) {
        const hasPriority = preferences.pregnant || preferences.elderly || 
                           preferences.disabled || preferences.infant;
                           
        const newCustomer: Customer = {
          // Let Supabase handle the UUID generation
          id: crypto.randomUUID(), // Generate proper UUID
          name,
          phone,
          partySize,
          preferences,
          timestamp: Date.now(),
          status: "waiting",
          priority: hasPriority,
        };
        
        onRegister(newCustomer);
        toast.success("Cadastro realizado com sucesso!");
        
        setName("");
        setPhone("");
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
      } else {
        setError("Você precisa estar próximo ao restaurante para entrar na fila (50m)");
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setError("Erro ao verificar localização. Verifique as permissões de GPS.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-blue-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gastro-blue to-blue-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <User className="h-6 w-6" />
          Entre na Fila
        </h2>
        <p className="text-blue-100 text-center">
          Preencha seus dados para entrar na fila de espera
        </p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 mx-6 mt-4 rounded-md flex items-start gap-3">
          <AlertCircle className="text-red-500 h-5 w-5 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <Label htmlFor="name" className="text-gastro-gray font-semibold flex items-center gap-1">
            <User className="h-4 w-4 text-gastro-blue" />
            Nome completo
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 border-2 border-blue-100 focus:border-gastro-blue"
            placeholder="Digite seu nome completo"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-gastro-gray font-semibold flex items-center gap-1">
            <Heart className="h-4 w-4 text-gastro-blue" />
            Telefone
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            className="mt-1 border-2 border-blue-100 focus:border-gastro-blue"
            placeholder="DDD + Número (apenas números)"
            disabled={isLoading}
          />
          {phone && (
            <p className="text-xs text-gastro-blue mt-1">
              Formatado: {formatPhoneDisplay(phone)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="partySize" className="text-gastro-gray font-semibold flex items-center gap-1">
            <User className="h-4 w-4 text-gastro-blue" />
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
          {partySize >= 8 && (
            <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Para grupos grandes, o tempo de espera pode ser maior.
            </p>
          )}
        </div>

        <div>
          <p className="text-gastro-gray font-semibold mb-2">Preferências Prioritárias</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 transition-colors">
              <Checkbox
                id="pregnant"
                checked={preferences.pregnant}
                onCheckedChange={() => handlePreferenceChange("pregnant")}
                disabled={isLoading}
                className="border-gastro-blue data-[state=checked]:bg-gastro-orange"
              />
              <label
                htmlFor="pregnant"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
              >
                <Heart className="h-4 w-4 text-gastro-orange" />
                Gestante
              </label>
            </div>
            
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 transition-colors">
              <Checkbox
                id="elderly"
                checked={preferences.elderly}
                onCheckedChange={() => handlePreferenceChange("elderly")}
                disabled={isLoading}
                className="border-gastro-blue data-[state=checked]:bg-gastro-orange"
              />
              <label
                htmlFor="elderly"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
              >
                <User className="h-4 w-4 text-gastro-orange" />
                Idoso
              </label>
            </div>
            
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 transition-colors">
              <Checkbox
                id="disabled"
                checked={preferences.disabled}
                onCheckedChange={() => handlePreferenceChange("disabled")}
                disabled={isLoading}
                className="border-gastro-blue data-[state=checked]:bg-gastro-orange"
              />
              <label
                htmlFor="disabled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
              >
                <Heart className="h-4 w-4 text-gastro-orange" />
                PCD
              </label>
            </div>
            
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 transition-colors">
              <Checkbox
                id="infant"
                checked={preferences.infant}
                onCheckedChange={() => handlePreferenceChange("infant")}
                disabled={isLoading}
                className="border-gastro-blue data-[state=checked]:bg-gastro-orange"
              />
              <label
                htmlFor="infant"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
              >
                <User className="h-4 w-4 text-gastro-orange" />
                Criança de colo
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <p className="text-gastro-gray font-semibold mb-2">Outras Preferências</p>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 transition-colors">
              <Checkbox
                id="withDog"
                checked={preferences.withDog}
                onCheckedChange={() => handlePreferenceChange("withDog")}
                disabled={isLoading}
                className="border-gastro-blue data-[state=checked]:bg-gastro-blue"
              />
              <label
                htmlFor="withDog"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
              >
                <Shield className="h-4 w-4 text-gastro-blue" />
                Com cachorro (seleciona automaticamente mesa externa)
              </label>
            </div>
            
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 transition-colors">
              <Checkbox
                id="indoor"
                checked={preferences.indoor}
                onCheckedChange={() => handlePreferenceChange("indoor")}
                disabled={isLoading || preferences.withDog}
                className="border-gastro-blue data-[state=checked]:bg-gastro-blue"
              />
              <label
                htmlFor="indoor"
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${preferences.withDog ? 'opacity-50' : 'opacity-100'} flex items-center gap-1 cursor-pointer`}
              >
                <Home className="h-4 w-4 text-gastro-blue" />
                Mesa interna
              </label>
            </div>
            
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 transition-colors">
              <Checkbox
                id="outdoor"
                checked={preferences.outdoor}
                onCheckedChange={() => handlePreferenceChange("outdoor")}
                disabled={isLoading || preferences.withDog}
                className="border-gastro-blue data-[state=checked]:bg-gastro-blue"
              />
              <label
                htmlFor="outdoor"
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${preferences.withDog ? 'opacity-50' : 'opacity-100'} flex items-center gap-1 cursor-pointer`}
              >
                <Wind className="h-4 w-4 text-gastro-blue" />
                Mesa externa
              </label>
            </div>
          </div>
          
          {preferences.withDog && (
            <p className="text-xs text-gastro-blue mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Para clientes com cachorro, apenas mesas externas estão disponíveis.
            </p>
          )}
        </div>

        <div className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <label 
              htmlFor="bypassGeo" 
              className="flex items-center cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bypassGeo"
                  checked={bypassGeolocation}
                  onCheckedChange={toggleBypassGeolocation}
                />
                <span className="text-sm text-gastro-gray">
                  Ignorar verificação de localização (para teste)
                </span>
              </div>
            </label>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gastro-gray mb-4 bg-blue-50 p-3 rounded-lg">
            <MapPin className="h-4 w-4 text-gastro-blue" />
            <div className="text-center">
              <p className="font-medium text-gastro-blue">Quatro Gastro Burger</p>
              <p className="text-xs">R. Dr. José Guimarães, 758 - Jardim Irajá, Ribeirão Preto - SP, 14020-560</p>
              <p className="text-xs mt-1">Verificação de proximidade: 50 metros</p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gastro-orange hover:bg-orange-600 text-white font-bold py-3" 
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Entrar na Fila"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
