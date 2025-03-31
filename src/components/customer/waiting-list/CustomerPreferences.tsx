
import React from "react";
import { Heart, User, Shield, Home, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Preferences } from "@/types";

interface CustomerPreferencesProps {
  preferences: Preferences;
}

export const CustomerPreferences: React.FC<CustomerPreferencesProps> = ({ preferences }) => {
  const getPreferenceIcon = (key: string, value: boolean) => {
    if (!value) return null;
    
    switch(key) {
      case 'pregnant':
        return <Heart className="h-3 w-3 text-gastro-orange" />;
      case 'elderly':
        return <User className="h-3 w-3 text-gastro-orange" />;
      case 'disabled':
        return <Heart className="h-3 w-3 text-gastro-orange" />;
      case 'infant':
        return <User className="h-3 w-3 text-gastro-orange" />;
      case 'withDog':
        return <Shield className="h-3 w-3 text-gastro-blue" />;
      case 'indoor':
        return <Home className="h-3 w-3 text-gastro-blue" />;
      case 'outdoor':
        return <Wind className="h-3 w-3 text-gastro-blue" />;
      default:
        return null;
    }
  };

  const items = [];
  
  if (preferences.pregnant) items.push({ key: 'pregnant', label: 'Gestante', priority: true });
  if (preferences.elderly) items.push({ key: 'elderly', label: 'Idoso', priority: true });
  if (preferences.disabled) items.push({ key: 'disabled', label: 'PCD', priority: true });
  if (preferences.infant) items.push({ key: 'infant', label: 'Criança de colo', priority: true });
  
  if (preferences.withDog) items.push({ key: 'withDog', label: 'Com cachorro', priority: false });
  if (preferences.indoor) items.push({ key: 'indoor', label: 'Mesa interna', priority: false });
  if (preferences.outdoor) items.push({ key: 'outdoor', label: 'Mesa externa', priority: false });
  
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, index) => (
        <Badge 
          key={index} 
          variant="outline" 
          className={`flex items-center gap-1 text-xs ${
            item.priority ? 'border-gastro-orange text-gastro-orange' : 'border-gastro-blue text-gastro-blue'
          }`}
        >
          {getPreferenceIcon(item.key, true)}
          {item.label}
        </Badge>
      ))}
    </div>
  );
};
