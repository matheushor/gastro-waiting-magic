
import React, { useState } from "react";
import { Customer, Preferences } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

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
  React.useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setPartySize(customer.partySize);
      setPreferences(customer.preferences);
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

    // Make sure at least one of indoor or outdoor is selected
    const updatedPreferences = { ...preferences };
    if (!preferences.indoor && !preferences.outdoor) {
      updatedPreferences.indoor = true;
    }

    const updatedCustomer: Customer = {
      ...customer,
      name,
      phone,
      partySize,
      preferences: updatedPreferences,
      priority: updatedPreferences.pregnant || updatedPreferences.elderly || updatedPreferences.disabled || updatedPreferences.infant,
    };

    onSave(updatedCustomer);
  };

  const togglePreference = (key: keyof Preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    // If toggling indoor/outdoor, make sure at least one is selected
    if (key === "indoor" && preferences.indoor && !preferences.outdoor) {
      setPreferences((prev) => ({
        ...prev,
        outdoor: true,
      }));
    } else if (key === "outdoor" && preferences.outdoor && !preferences.indoor) {
      setPreferences((prev) => ({
        ...prev,
        indoor: true,
      }));
    }
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
            <Input
              id="partySize"
              type="number"
              min={1}
              value={partySize}
              onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label>Preferências</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pregnant"
                  checked={preferences.pregnant}
                  onCheckedChange={() => togglePreference("pregnant")}
                />
                <Label htmlFor="pregnant" className="text-sm">Gestante</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="elderly"
                  checked={preferences.elderly}
                  onCheckedChange={() => togglePreference("elderly")}
                />
                <Label htmlFor="elderly" className="text-sm">Idoso</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="disabled"
                  checked={preferences.disabled}
                  onCheckedChange={() => togglePreference("disabled")}
                />
                <Label htmlFor="disabled" className="text-sm">PCD</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="infant"
                  checked={preferences.infant}
                  onCheckedChange={() => togglePreference("infant")}
                />
                <Label htmlFor="infant" className="text-sm">Criança de colo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="withDog"
                  checked={preferences.withDog}
                  onCheckedChange={() => togglePreference("withDog")}
                />
                <Label htmlFor="withDog" className="text-sm">Com cachorro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="indoor"
                  checked={preferences.indoor}
                  onCheckedChange={() => togglePreference("indoor")}
                />
                <Label htmlFor="indoor" className="text-sm">Mesa interna</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="outdoor"
                  checked={preferences.outdoor}
                  onCheckedChange={() => togglePreference("outdoor")}
                />
                <Label htmlFor="outdoor" className="text-sm">Mesa externa</Label>
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
