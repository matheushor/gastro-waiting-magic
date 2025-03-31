
import React from "react";
import { UserCheck, Coffee, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types";

interface CurrentCustomerProps {
  currentlyServing: Customer | null;
  onFinishServing: (id: string) => void;
  onRemoveCustomer: (customer: Customer) => void;
  renderPreferences: (customer: Customer) => React.ReactNode;
}

const CurrentCustomer: React.FC<CurrentCustomerProps> = ({
  currentlyServing,
  onFinishServing,
  onRemoveCustomer,
  renderPreferences,
}) => {
  if (!currentlyServing) return null;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gastro-blue mb-3 flex items-center">
        <UserCheck className="h-5 w-5 mr-2" />
        Cliente Atual
      </h2>
      <div className="bg-orange-50 border border-gastro-orange p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{currentlyServing.name}</h3>
            <div className="flex items-center text-sm text-gastro-gray">
              <span className="mr-2">{currentlyServing.partySize} {currentlyServing.partySize > 1 ? 'pessoas' : 'pessoa'}</span>
              •
              <span className="ml-2">Tel: {currentlyServing.phone}</span>
            </div>
            <div className="mt-2">
              {renderPreferences(currentlyServing)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onFinishServing(currentlyServing.id)}
              className="flex items-center gap-1 border-green-500 text-green-600 hover:bg-green-50"
            >
              <Coffee className="h-4 w-4" />
              <span>Atendido</span>
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onRemoveCustomer(currentlyServing)}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span>Remover</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentCustomer;
