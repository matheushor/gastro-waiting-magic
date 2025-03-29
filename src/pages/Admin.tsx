
import React, { useState, useEffect } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { WaitingQueueState } from "@/types";
import { toast } from "sonner";
import { subscribeToQueueChanges, updateCustomerStatus, removeCustomer } from "@/services/waitingQueueService";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [queueState, setQueueState] = useState<WaitingQueueState>({ customers: [], currentlyServing: null });

  // Inscreve-se para atualizações em tempo real quando logado
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const unsubscribe = subscribeToQueueChanges(setQueueState);
    
    return () => unsubscribe();
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    toast.success("Login realizado com sucesso!");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleCallNext = async () => {
    const waitingCustomers = queueState.customers.filter(c => c.status === "waiting");
    
    if (waitingCustomers.length > 0) {
      // Sort by timestamp to get the longest waiting customer
      const sortedCustomers = [...waitingCustomers].sort((a, b) => a.timestamp - b.timestamp);
      const nextCustomer = sortedCustomers[0];
      
      try {
        // Atualiza o status do cliente para "called"
        await updateCustomerStatus(nextCustomer.id, "called");
        toast.success(`${nextCustomer.name} foi chamado!`);
      } catch (error) {
        console.error("Erro ao chamar próximo cliente:", error);
        toast.error("Erro ao chamar próximo cliente. Tente novamente.");
      }
    } else {
      toast.error("Não há clientes na fila de espera.");
    }
  };

  const handleRemoveCustomer = async (id: string) => {
    try {
      await removeCustomer(id);
      toast.success("Cliente removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
      toast.error("Erro ao remover cliente. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoggedIn ? (
        <div className="py-12 px-4">
          <AdminLogin onLogin={handleLogin} />
        </div>
      ) : (
        <AdminDashboard
          customers={queueState.customers}
          onCallNext={handleCallNext}
          onRemoveCustomer={handleRemoveCustomer}
          onLogout={handleLogout}
          currentlyServing={queueState.currentlyServing}
        />
      )}
    </div>
  );
};

export default Admin;
