
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Preferences } from "@/types";
import { Heart, User } from "lucide-react";

interface PriorityPreferencesProps {
  preferences: Preferences;
  onPreferenceChange: (key: keyof Preferences) => void;
  disabled?: boolean;
}

const PriorityPreferences: React.FC<PriorityPreferencesProps> = ({
  preferences,
  onPreferenceChange,
  disabled = false
}) => {
  return (
    <div>
      <p className="text-gastro-gray font-semibold mb-2">Preferências Prioritárias</p>
      <div className="space-y-2 bg-blue-50 p-2 rounded-md">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="admin-pregnant"
            checked={preferences.pregnant}
            onCheckedChange={() => onPreferenceChange("pregnant")}
            disabled={disabled}
            className="border-gastro-blue data-[state=checked]:bg-gastro-orange"
          />
          <label
            htmlFor="admin-pregnant"
            className="text-sm font-medium flex items-center gap-1 cursor-pointer"
          >
            <Heart className="h-4 w-4 text-gastro-orange" />
            Gestante
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="admin-elderly"
            checked={preferences.elderly}
            onCheckedChange={() => onPreferenceChange("elderly")}
            disabled={disabled}
            className="border-gastro-blue data-[state=checked]:bg-gastro-orange"
          />
          <label
            htmlFor="admin-elderly"
            className="text-sm font-medium flex items-center gap-1 cursor-pointer"
          >
            <User className="h-4 w-4 text-gastro-orange" />
            Idoso
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="admin-disabled"
            checked={preferences.disabled}
            onCheckedChange={() => onPreferenceChange("disabled")}
            disabled={disabled}
            className="border-gastro-blue data-[state=checked]:bg-gastro-orange"
          />
          <label
            htmlFor="admin-disabled"
            className="text-sm font-medium flex items-center gap-1 cursor-pointer"
          >
            <Heart className="h-4 w-4 text-gastro-orange" />
            PCD
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="admin-infant"
            checked={preferences.infant}
            onCheckedChange={() => onPreferenceChange("infant")}
            disabled={disabled}
            className="border-gastro-blue data-[state=checked]:bg-gastro-orange"
          />
          <label
            htmlFor="admin-infant"
            className="text-sm font-medium flex items-center gap-1 cursor-pointer"
          >
            <User className="h-4 w-4 text-gastro-orange" />
            Criança de colo
          </label>
        </div>
      </div>
    </div>
  );
};

export default PriorityPreferences;
