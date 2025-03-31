
import React from "react";
import { Preferences } from "@/types";
import PriorityPreferences from "./PriorityPreferences";
import OtherPreferences from "./OtherPreferences";

interface PreferencesSectionProps {
  preferences: Preferences;
  onPreferenceChange: (key: keyof Preferences) => void;
  disabled?: boolean;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  preferences,
  onPreferenceChange,
  disabled = false
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PriorityPreferences 
        preferences={preferences} 
        onPreferenceChange={onPreferenceChange} 
        disabled={disabled} 
      />
      
      <OtherPreferences 
        preferences={preferences} 
        onPreferenceChange={onPreferenceChange} 
        disabled={disabled} 
      />
    </div>
  );
};

export default PreferencesSection;
