
import React, { useState } from "react";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { BellRing, Users, Clock, LogOut, UserCheck, X } from "lucide-react";
import { formatWaitingTime } from "@/utils/geoUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface AdminDashboardProps {
  customers: Customer[];
  onCallNext: () => void;
  onRemoveCustomer: (id: string) => void;
  onLogout: () => void;
  currentlyServing: Customer | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  customers,
  onCallNext,
  onRemoveCustomer,
  onLogout,
  currentlyServing,
}) => {
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [customerToRemove, setCustomerToRemove] = useState<Customer | null>(null);

  // Count waiting customers
  const waitingCount = customers.filter(c => c.status === "waiting").length;

  // Get waiting customers sorted by timestamp
  const waitingCustomers = [...customers]
    .filter(c => c.status === "waiting")
    .sort((a, b) => a.timestamp - b.timestamp);

  const handleRemoveClick = (customer: Customer) => {
    setCustomerToRemove(customer);
    setConfirmDialog(true);
  };

  const confirmRemove = () => {
    if (customerToRemove) {
      onRemoveCustomer(customerToRemove.id);
      toast.success(`${customerToRemove.name} foi removido da fila`);
      setConfirmDialog(false);
    }
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

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gastro-blue">Painel Administrativo</h1>
          <p className="text-gastro-gray">4 Gastro Burger</p>
        </div>
        <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gastro-blue text-white p-6 rounded-lg shadow-md flex items-center">
          <Users className="h-10 w-10 mr-4" />
          <div>
            <h2 className="text-3xl font-bold">{waitingCount}</h2>
            <p className="text-sm">Clientes na fila</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <Clock className="h-10 w-10 mr-4 text-gastro-gray" />
          <div>
            <h2 className="text-3xl font-bold text-gastro-blue">
              {waitingCount > 0 
                ? formatWaitingTime(waitingCustomers[0].timestamp) 
                : "0 min"}
            </h2>
            <p className="text-sm text-gastro-gray">Tempo do próximo</p>
          </div>
        </div>
        
        <div>
          <Button 
            onClick={onCallNext} 
            disabled={waitingCount === 0 || currentlyServing !== null}
            className="h-full w-full bg-gastro-orange hover:bg-orange-600 text-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center"
          >
            <BellRing className="h-10 w-10 mb-2" />
            <span className="text-lg font-semibold">Chamar Próximo</span>
          </Button>
        </div>
      </div>

      {currentlyServing && (
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
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleRemoveClick(currentlyServing)}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                <span>Remover</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gastro-blue mb-3">Fila de Espera</h2>
        
        {waitingCustomers.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gastro-gray">Não há clientes na fila no momento.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {waitingCustomers.map((customer, index) => (
              <div key={customer.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <div className="bg-gastro-blue text-white h-6 w-6 rounded-full flex items-center justify-center text-sm mr-2">
                        {index + 1}
                      </div>
                      <h3 className="font-semibold">{customer.name}</h3>
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
                      {renderPreferences(customer)}
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveClick(customer)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar remoção</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja remover {customerToRemove?.name} da fila?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmRemove}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
