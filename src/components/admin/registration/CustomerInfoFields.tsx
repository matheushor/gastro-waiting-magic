
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User, Users } from "lucide-react";

interface CustomerInfoFieldsProps {
  name: string;
  setName: (name: string) => void;
  onPartySizeChange: (value: string) => void;
  disabled?: boolean;
}

const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
  name,
  setName,
  onPartySizeChange,
  disabled = false
}) => {
  return (
    <>
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
          disabled={disabled}
        />
      </div>

      <div>
        <Label htmlFor="admin-partySize" className="text-gastro-gray font-semibold flex items-center gap-1">
          <Users className="h-4 w-4 text-gastro-blue" />
          Número de pessoas
        </Label>
        <Select onValueChange={onPartySizeChange} defaultValue="1">
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
    </>
  );
};

export default CustomerInfoFields;
