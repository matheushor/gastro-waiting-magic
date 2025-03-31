
import React, { useState } from "react";
import { Customer } from "@/types";
import { Users } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { LeaveQueueDialog } from "./waiting-list/LeaveQueueDialog";
import { CustomerCard } from "./waiting-list/CustomerCard";
import { WaitingListHeader } from "./waiting-list/WaitingListHeader";
import { WaitingListEmpty } from "./waiting-list/WaitingListEmpty";
import { PriorityNotice } from "./waiting-list/PriorityNotice";

interface WaitingListProps {
  customers: Customer[];
  onLeaveQueue: (id: string) => void;
}

const WaitingList: React.FC<WaitingListProps> = ({ customers, onLeaveQueue }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [confirmPhone, setConfirmPhone] = useState("");
  const [error, setError] = useState("");

  const calledCustomers = customers.filter(c => c.status === "called");
  const priorityCustomers = customers.filter(c => c.status === "waiting" && c.priority);
  const regularCustomers = customers.filter(c => c.status === "waiting" && !c.priority);
  
  const sortByTimestamp = (a: Customer, b: Customer) => a.timestamp - b.timestamp;
  const sortedPriorityCustomers = [...priorityCustomers].sort(sortByTimestamp);
  const sortedRegularCustomers = [...regularCustomers].sort(sortByTimestamp);
  
  const sortedCustomers = [
    ...calledCustomers,
    ...sortedPriorityCustomers,
    ...sortedRegularCustomers
  ];

  // Assign positions to customers
  let waitingPosition = 1;
  sortedCustomers.forEach(customer => {
    if (customer.status === "waiting") {
      customer.position = waitingPosition++;
    } else if (customer.status === "called") {
      customer.position = 0;
    } else {
      customer.position = undefined;
    }
  });

  const handleLeaveQueueClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setConfirmPhone("");
    setError("");
    setOpenDialog(true);
  };

  const handleConfirmLeaveQueue = () => {
    if (!selectedCustomer) return;
    
    if (confirmPhone !== selectedCustomer.phone) {
      setError("Telefone não confere. Tente novamente.");
      return;
    }
    
    onLeaveQueue(selectedCustomer.id);
    setOpenDialog(false);
  };

  const waitingCount = customers.filter(c => c.status === 'waiting').length;
  const priorityCount = customers.filter(c => c.status === 'waiting' && c.priority).length;

  if (sortedCustomers.length === 0) {
    return <WaitingListEmpty />;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-blue-100 overflow-hidden">
      <WaitingListHeader />
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-blue-50 rounded-lg mb-4 gap-2">
          <WaitingListHeader waitingCount={waitingCount} priorityCount={priorityCount} />
        </div>
        
        <div className="space-y-3">
          {sortedCustomers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              onLeaveQueueClick={handleLeaveQueueClick} 
            />
          ))}
        </div>
        
        {waitingCount > 0 && <PriorityNotice />}
      </div>
      
      <LeaveQueueDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        confirmPhone={confirmPhone}
        onConfirmPhoneChange={setConfirmPhone}
        error={error}
        onConfirm={handleConfirmLeaveQueue}
      />
    </div>
  );
};

export default WaitingList;
