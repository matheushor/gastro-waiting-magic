
import React, { useState } from "react";
import { Customer } from "@/types";
import { Clock, AlertCircle, X, User, Users } from "lucide-react";
import { formatWaitingTime } from "@/utils/geoUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WaitingListProps {
  customers: Customer[];
  onLeaveQueue: (id: string) => void;
}

const WaitingList: React.FC<WaitingListProps> = ({ customers, onLeaveQueue }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [confirmPhone, setConfirmPhone] = useState("");
  const [error, setError] = useState("");

  // Sort customers by status and timestamp
  const sortedCustomers = [...customers].sort((a, b) => {
    // First, put called customers at the top
    if (a.status === "called" && b.status !== "called") return -1;
    if (a.status !== "called" && b.status === "called") return 1;
    
    // Then sort by timestamp (earliest first)
    return a.timestamp - b.timestamp;
  });

  // Assign positions to waiting customers
  let waitingPosition = 1;
  sortedCustomers.forEach(customer => {
    if (customer.status === "waiting") {
      customer.position = waitingPosition++;
    } else if (customer.status === "called") {
      customer.position = 0; // Being served
    } else {
      customer.position = undefined; // Not in the queue anymore
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

  const renderPreferences = (customer: Customer) => {
    const { preferences } = customer;
    const activePreferences = [];
    
    if (preferences.pregnant) activePreferences.push("Gestante");
    if (preferences.elderly) activePreferences.push("Idoso");
    if (preferences.disabled) activePreferences.push("PCD");
    if (preferences.infant) activePreferences.push("Criança de colo");
    if (preferences.withDog) activePreferences.push("Com cachorro");
    if (preferences.indoor) activePreferences.push("Mesa interna");
    else activePreferences.push("Mesa externa");
    
    return activePreferences.map((pref, index) => (
      <span key={index} className="preference-tag">
        {pref}
      </span>
    ));
  };
  
  // Calculate average waiting time
  const calculateAverageWaitTime = () => {
    const waitingCustomers = customers.filter(c => c.status === 'waiting');
    if (waitingCustomers.length <= 1) return null;
    
    const timestamps = waitingCustomers.map(c => c.timestamp).sort((a, b) => a - b);
    let totalDiff = 0;
    
    for (let i = 1; i < timestamps.length; i++) {
      totalDiff += timestamps[i] - timestamps[i-1];
    }
    
    const avgDiffMs = totalDiff / (timestamps.length - 1);
    return Math.ceil(avgDiffMs / 60000); // Convert to minutes and round up
  };
  
  const avgWaitTime = calculateAverageWaitTime();
  const waitingCount = customers.filter(c => c.status === 'waiting').length;

  if (sortedCustomers.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-auto text-center">
        <h2 className="text-xl font-bold text-gastro-blue mb-2">Fila de Espera</h2>
        <div className="py-8">
          <p className="text-gastro-gray mb-2">Não há clientes na fila no momento.</p>
          <p className="text-sm text-gastro-gray">Seja o primeiro a entrar!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-auto">
      <h2 className="text-xl font-bold text-gastro-blue mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2" />
        Fila de Espera
      </h2>
      
      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg mb-4">
        <div className="flex items-center">
          <User className="h-4 w-4 text-gastro-blue mr-2" />
          <span className="text-sm font-medium text-gastro-blue">{waitingCount} {waitingCount === 1 ? 'pessoa' : 'pessoas'} na fila</span>
        </div>
        {avgWaitTime && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gastro-orange mr-1" />
            <span className="text-sm font-medium text-gastro-orange">
              ~{avgWaitTime} min por pessoa
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {sortedCustomers.map((customer) => (
          <div 
            key={customer.id} 
            className={`border rounded-lg p-4 relative ${
              customer.status === "called" 
                ? "border-gastro-orange bg-orange-50" 
                : "border-gastro-lightGray hover:border-gastro-blue transition-colors"
            }`}
          >
            {customer.status === "called" && (
              <div className="absolute -top-2 -right-2 bg-gastro-orange text-white text-xs px-2 py-1 rounded-full animate-pulse-slow">
                Chamando
              </div>
            )}
            
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{customer.name}</h3>
                <div className="flex items-center text-sm text-gastro-gray">
                  <span className="mr-2">{customer.partySize} {customer.partySize > 1 ? 'pessoas' : 'pessoa'}</span>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="waiting-time">
                      {formatWaitingTime(customer.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
              
              {customer.position !== undefined && (
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  customer.status === "called" 
                    ? "bg-gastro-orange text-white" 
                    : "bg-gastro-blue text-white"
                }`}>
                  {customer.status === "called" ? "0" : customer.position}
                </div>
              )}
            </div>
            
            <div className="mb-3">
              {renderPreferences(customer)}
            </div>
            
            <button 
              onClick={() => handleLeaveQueueClick(customer)}
              className="text-red-500 text-sm flex items-center hover:text-red-700 transition-colors"
            >
              <X className="h-3 w-3 mr-1" />
              Sair da fila
            </button>
          </div>
        ))}
      </div>
      
      {waitingCount > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gastro-gray">
            Tempo estimado de espera: <strong className="text-gastro-blue">
              {avgWaitTime ? `~${avgWaitTime * waitingCount} minutos` : 'Calculando...'}
            </strong>
          </p>
        </div>
      )}
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar saída da fila</DialogTitle>
            <DialogDescription>
              Para confirmar que é você, digite o número de telefone que você usou para entrar na fila.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="DDD + Número (apenas números)"
              value={confirmPhone}
              onChange={(e) => setConfirmPhone(e.target.value.replace(/\D/g, ""))}
            />
            
            {error && (
              <div className="mt-2 flex items-center text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmLeaveQueue}
            >
              Confirmar Saída
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaitingList;
