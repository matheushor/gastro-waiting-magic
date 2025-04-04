
import React from "react";
import { Clock, Coffee, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types";
import { formatWaitingTime } from "@/utils/geoUtils";

interface CustomerCardProps {
  customer: Customer;
  position: number;
  onRemove: () => void;
  onFinishServing?: () => void;
  isPriority?: boolean;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ 
  customer, 
  position, 
  onRemove, 
  onFinishServing, 
  isPriority 
}) => {
  const { preferences } = customer;
  const activePreferences = [];
  
  if (preferences.pregnant) activePreferences.push("Gestante");
  if (preferences.elderly) activePreferences.push("Idoso");
  if (preferences.disabled) activePreferences.push("PCD");
  if (preferences.infant) activePreferences.push("Criança de colo");
  if (preferences.withDog) activePreferences.push("Com cachorro");
  if (preferences.indoor) activePreferences.push("Mesa interna");
  else activePreferences.push("Mesa externa");
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${isPriority ? 'border-l-4 border-gastro-orange' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <div className={`${
              customer.status === "called" 
                ? "bg-gastro-orange" 
                : "bg-gastro-blue"
            } text-white h-6 w-6 rounded-full flex items-center justify-center text-sm mr-2`}>
              {position}
            </div>
            <h3 className="font-semibold">{customer.name}</h3>
            {isPriority && (
              <span className="ml-2 bg-orange-100 text-gastro-orange text-xs px-2 py-0.5 rounded-full">
                Prioritário
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gastro-gray mt-1">
            <span className="mr-2">{customer.partySize} {customer.partySize > 1 ? 'pessoas' : 'pessoa'}</span>
            •
            <span className="mx-2">Tel: {customer.phone}</span>
            •
            <Clock className="h-3 w-3 mx-1" />
            <span className="waiting-time">
              {formatWaitingTime(customer.timestamp)}
            </span>
          </div>
          
          <div className="mt-2">
            {activePreferences.map((pref, index) => (
              <span key={index} className="preference-tag">
                {pref}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          {onFinishServing && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onFinishServing}
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <Coffee className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
