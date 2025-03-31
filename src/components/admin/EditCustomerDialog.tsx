
import React, { useState, useEffect } from "react";
import { Customer, Preferences } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Heart, User, Home, Wind, Shield } from "lucide-react";

interface EditCustomerDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (customer: Customer) => void;
}

const EditCustomerDialog: React.FC<EditCustomerDialogProps> = ({
  customer,
  open,
  onOpenChange,
  onSave,
}) => {
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

  // Set initial values when customer changes
  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setPartySize(customer.partySize);
      // Create a new preferences object with default values of false for any missing properties
      const updatedPreferences: Preferences = {
        pregnant: false,
        elderly: false,
        disabled: false,
        infant: false,
        withDog: false,
        indoor: false,
        outdoor: false,
        ...customer.preferences, // Override with actual customer preferences
      };
      setPreferences(updatedPreferences);
    }
  }, [customer]);

  const handleSave = () => {
    if (!customer) return;
    if (!name.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }
    if (!phone.trim()) {
      toast.error("O telefone é obrigatório");
      return;
    }
    if (partySize < 1) {
      toast.error("O número de pessoas deve ser pelo menos 1");
      return;
    }

    const updatedCustomer: Customer = {
      ...customer,
      name,
      phone,
      partySize,
      preferences,
      priority: preferences.pregnant || preferences.elderly || preferences.disabled || preferences.infant,
    };

    onSave(updatedCustomer);
  };

  const togglePreference = (key: keyof Preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePartySizeChange = (change: number) => {
    setPartySize(Math.max(1, partySize + change));
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do cliente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="DDD + Número (apenas números)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partySize">Número de pessoas</Label>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePartySizeChange(-1)}
                className="border-gastro-blue text-gastro-blue"
              >
                -
              </Button>
              <div className="w-12 text-center font-semibold">{partySize}</div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePartySizeChange(1)}
                className="border-gastro-blue text-gastro-blue"
              >
                +
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gastro-blue flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Necessidades específicas
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pregnant"
                  checked={preferences.pregnant}
                  onCheckedChange={() => togglePreference("pregnant")}
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
                  onCheckedChange={() => togglePreference("elderly")}
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
                  onCheckedChange={() => togglePreference("disabled")}
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
                  onCheckedChange={() => togglePreference("infant")}
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
                  onCheckedChange={() => togglePreference("withDog")}
                />
                <Label htmlFor="withDog" className="text-sm cursor-pointer">
                  Com cachorro
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gastro-blue flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Preferência de mesa
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="indoor"
                  checked={preferences.indoor}
                  onCheckedChange={() => togglePreference("indoor")}
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
                  onCheckedChange={() => togglePreference("outdoor")}
                />
                <Label htmlFor="outdoor" className="text-sm cursor-pointer flex items-center">
                  <Wind className="h-3 w-3 mr-1 text-green-600" />
                  Mesa externa
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerDialog;
