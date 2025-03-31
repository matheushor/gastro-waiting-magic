
import React from "react";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { UserCheck, Edit, Coffee, X } from "lucide-react";

interface CurrentCustomerProps {
  currentlyServing: Customer | null;
  onEdit: (customer: Customer) => void;
  onFinishServing: (id: string) => void;
  onRemove: (customer: Customer) => void;
}

const CurrentCustomer: React.FC<CurrentCustomerProps> = ({
  currentlyServing,
  onEdit,
  onFinishServing,
  onRemove
}) => {
  if (!currentlyServing) return null;

  const renderPreferences = (customer: Customer) => {
    const { preferences } = customer;
    const activePreferences = [];
    
    if (preferences.pregnant) activePreferences.push("Gestante");
    if (preferences.elderly) activePreferences.push("Idoso");
    if (preferences.disabled) activePreferences.push("PCD");
    if (preferences.infant) activePreferences.push("Criança de colo");
    if (preferences.withDog) activePreferences.push("Com cachorro");
    if (preferences.indoor) activePreferences.push("Mesa interna");
    if (preferences.outdoor) activePreferences.push("Mesa externa");
    
    return activePreferences.map((pref, index) => (
      <span key={index} className="preference-tag inline-block bg-blue-50 text-gastro-blue text-xs px-2 py-1 rounded-full mr-1 mb-1">
        {pref}
      </span>
    ));
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gastro-blue mb-3 flex items-center">
        <UserCheck className="h-5 w-5 mr-2" />
        Cliente Atual
      </h2>
      <div className="bg-orange-50 border border-gastro-orange p-4 rounded-lg">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h3 className="font-semibold text-lg">{currentlyServing.name}</h3>
            <div className="flex items-center text-sm text-gastro-gray flex-wrap">
              <span className="mr-2">{currentlyServing.partySize} {currentlyServing.partySize > 1 ? 'pessoas' : 'pessoa'}</span>
              •
              <span className="ml-2">Tel: {currentlyServing.phone}</span>
            </div>
            <div className="mt-2">
              {renderPreferences(currentlyServing)}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(currentlyServing)}
              className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
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
              onClick={() => onRemove(currentlyServing)}
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
