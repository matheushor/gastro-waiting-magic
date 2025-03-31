
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Preferences } from "@/types";
import { Shield, Home, Wind } from "lucide-react";

interface OtherPreferencesProps {
  preferences: Preferences;
  onPreferenceChange: (key: keyof Preferences) => void;
  disabled?: boolean;
}

const OtherPreferences: React.FC<OtherPreferencesProps> = ({
  preferences,
  onPreferenceChange,
  disabled = false
}) => {
  return (
    <div>
      <p className="text-gastro-gray font-semibold mb-2">Outras Preferências</p>
      <div className="space-y-2 bg-blue-50 p-2 rounded-md">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="admin-withDog"
            checked={preferences.withDog}
            onCheckedChange={() => onPreferenceChange("withDog")}
            disabled={disabled}
            className="border-gastro-blue data-[state=checked]:bg-gastro-blue"
          />
          <label
            htmlFor="admin-withDog"
            className="text-sm font-medium flex items-center gap-1 cursor-pointer"
          >
            <Shield className="h-4 w-4 text-gastro-blue" />
            Com cachorro
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="admin-indoor"
            checked={preferences.indoor}
            onCheckedChange={() => onPreferenceChange("indoor")}
            disabled={disabled || preferences.withDog}
            className="border-gastro-blue data-[state=checked]:bg-gastro-blue"
          />
          <label
            htmlFor="admin-indoor"
            className={`text-sm font-medium ${preferences.withDog ? 'opacity-50' : 'opacity-100'} flex items-center gap-1 cursor-pointer`}
          >
            <Home className="h-4 w-4 text-gastro-blue" />
            Mesa interna
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="admin-outdoor"
            checked={preferences.outdoor}
            onCheckedChange={() => onPreferenceChange("outdoor")}
            disabled={disabled || preferences.withDog}
            className="border-gastro-blue data-[state=checked]:bg-gastro-blue"
          />
          <label
            htmlFor="admin-outdoor"
            className={`text-sm font-medium ${preferences.withDog ? 'opacity-50' : 'opacity-100'} flex items-center gap-1 cursor-pointer`}
          >
            <Wind className="h-4 w-4 text-gastro-blue" />
            Mesa externa
          </label>
        </div>
      </div>
    </div>
  );
};

export default OtherPreferences;
