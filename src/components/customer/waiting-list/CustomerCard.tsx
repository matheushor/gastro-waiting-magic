
import React from "react";
import { Customer } from "@/types";
import { Users, Clock, X, ShieldAlert } from "lucide-react";
import { formatWaitingTime } from "@/utils/geoUtils";
import { CustomerPreferences } from "./CustomerPreferences";

interface CustomerCardProps {
  customer: Customer;
  onLeaveQueueClick: (customer: Customer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onLeaveQueueClick
}) => {
  return (
    <div 
      className={`border rounded-lg p-4 relative transition-all hover:shadow-md ${
        customer.status === "called" 
          ? "border-gastro-orange bg-orange-50" 
          : customer.priority
            ? "border-gastro-orange/30 bg-orange-50/20"
            : "border-gastro-lightGray hover:border-gastro-blue"
      }`}
    >
      {customer.status === "called" && (
        <div className="absolute -top-2 -right-2 bg-gastro-orange text-white text-xs px-2 py-1 rounded-full animate-pulse-slow font-bold flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" />
          Chamando
        </div>
      )}
      
      {customer.priority && customer.status === "waiting" && (
        <div className="absolute -top-2 -right-2 bg-gastro-orange/80 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" />
          Prioritário
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gastro-blue">{customer.name}</h3>
          <div className="flex items-center text-sm text-gastro-gray gap-2 mt-1">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {customer.partySize} {customer.partySize > 1 ? 'pessoas' : 'pessoa'}
            </span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-gastro-blue">
                {formatWaitingTime(customer.timestamp)}
              </span>
            </div>
          </div>
        </div>
        
        {customer.position !== undefined && (
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
            customer.status === "called" 
              ? "bg-gastro-orange text-white" 
              : customer.priority
                ? "bg-gastro-orange/80 text-white"
                : "bg-gastro-blue text-white"
          }`}>
            {customer.status === "called" ? "0" : customer.position}
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <CustomerPreferences preferences={customer.preferences} />
      </div>
      
      <button 
        onClick={() => onLeaveQueueClick(customer)}
        className="text-red-500 text-sm flex items-center hover:text-red-700 transition-colors"
      >
        <X className="h-3 w-3 mr-1" />
        Sair da fila
      </button>
    </div>
  );
};
