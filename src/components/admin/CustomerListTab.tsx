
import React from "react";
import { Customer } from "@/types";
import CustomerCard from "./CustomerCard";

interface CustomerListTabProps {
  title: string;
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onRemove: (customer: Customer) => void;
  onFinishServing?: (id: string) => void;
  isPriority?: boolean;
  emptyMessage: string;
  isMobile: boolean;
}

const CustomerListTab: React.FC<CustomerListTabProps> = ({
  title,
  customers,
  onEdit,
  onRemove,
  onFinishServing,
  isPriority = false,
  emptyMessage,
  isMobile = false
}) => {
  // Make sure we have a valid customers array to prevent rendering issues
  const validCustomers = Array.isArray(customers) ? customers : [];
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gastro-blue mb-3">{title}</h2>
      
      {validCustomers.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gastro-gray">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {validCustomers.map((customer, index) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              position={index + 1}
              onRemove={() => onRemove(customer)}
              onEdit={() => onEdit(customer)}
              onFinishServing={onFinishServing ? () => onFinishServing(customer.id) : undefined}
              isPriority={isPriority}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerListTab;
