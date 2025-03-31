
import { useState, useEffect } from "react";
import { Customer, Preferences } from "@/types";
import { toast } from "sonner";

export const useRegistrationForm = (onRegister: (customer: Customer) => void) => {
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

  // Update preferences when "withDog" is selected
  useEffect(() => {
    if (preferences.withDog) {
      setPreferences(prev => ({
        ...prev,
        outdoor: true,
        indoor: false
      }));
    }
  }, [preferences.withDog]);

  // Ensure only one type of table is selected at a time
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
      
      // If selecting indoor table, unselect outdoor table
      if (key === 'indoor' && newPrefs.indoor) {
        newPrefs.outdoor = false;
      }
      // If selecting outdoor table, unselect indoor table
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
        id: crypto.randomUUID(), // Generate proper UUID
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

  return {
    name,
    setName,
    partySize,
    preferences,
    isLoading,
    handlePreferenceChange,
    handlePartySizeChange,
    handleSubmit
  };
};
