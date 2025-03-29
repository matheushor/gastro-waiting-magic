
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Customer, Preferences } from "@/types";
import { getCurrentPosition, isWithinRadius, RESTAURANT_LOCATION } from "@/utils/geoUtils";
import { Label } from "@/components/ui/label";
import { AlertCircle, MapPin } from "lucide-react";

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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Bypass geolocation for testing
  const [bypassGeolocation, setBypassGeolocation] = useState(false);

  const handlePreferenceChange = (key: keyof Preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      setPhone(value);
    }
  };

  const handlePartySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 10) {
      setPartySize(value);
    }
  };

  const toggleBypassGeolocation = () => {
    setBypassGeolocation(!bypassGeolocation);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Validate inputs
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
        // Check geolocation
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
        const newCustomer: Customer = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          phone,
          partySize,
          preferences,
          timestamp: Date.now(),
          status: "waiting",
        };
        
        onRegister(newCustomer);
        toast.success("Cadastro realizado com sucesso!");
        
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
          indoor: true,
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
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gastro-blue mb-2">Entre na Fila</h2>
        <p className="text-gastro-gray">4 Gastro Burger</p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 h-5 w-5 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="gastro-label">Nome completo</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="gastro-input"
            placeholder="Digite seu nome completo"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="phone" className="gastro-label">Telefone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            className="gastro-input"
            placeholder="DDD + Número (apenas números)"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="partySize" className="gastro-label">
            Número de pessoas (máximo 10)
          </Label>
          <Input
            id="partySize"
            type="number"
            min="1"
            max="10"
            value={partySize}
            onChange={handlePartySizeChange}
            className="gastro-input"
            disabled={isLoading}
          />
          {partySize >= 8 && (
            <p className="text-amber-600 text-xs mt-1">
              Para grupos grandes, o tempo de espera pode ser maior.
            </p>
          )}
        </div>

        <div>
          <p className="gastro-label mb-2">Preferências</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pregnant"
                checked={preferences.pregnant}
                onCheckedChange={() => handlePreferenceChange("pregnant")}
                disabled={isLoading}
              />
              <label
                htmlFor="pregnant"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Gestante
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="elderly"
                checked={preferences.elderly}
                onCheckedChange={() => handlePreferenceChange("elderly")}
                disabled={isLoading}
              />
              <label
                htmlFor="elderly"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Idoso
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="disabled"
                checked={preferences.disabled}
                onCheckedChange={() => handlePreferenceChange("disabled")}
                disabled={isLoading}
              />
              <label
                htmlFor="disabled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                PCD
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="infant"
                checked={preferences.infant}
                onCheckedChange={() => handlePreferenceChange("infant")}
                disabled={isLoading}
              />
              <label
                htmlFor="infant"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Criança de colo
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="withDog"
                checked={preferences.withDog}
                onCheckedChange={() => handlePreferenceChange("withDog")}
                disabled={isLoading}
              />
              <label
                htmlFor="withDog"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Com cachorro
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="indoor"
                checked={preferences.indoor}
                onCheckedChange={() => handlePreferenceChange("indoor")}
                disabled={isLoading}
              />
              <label
                htmlFor="indoor"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mesa interna
              </label>
            </div>
          </div>
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
          
          <div className="flex items-center justify-center gap-2 text-sm text-gastro-gray mb-4">
            <MapPin className="h-4 w-4 text-gastro-blue" />
            <span>Verificação de proximidade: 50 metros</span>
          </div>

          <Button 
            type="submit" 
            className="w-full btn-accent" 
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
