
import React, { useState, useEffect, useCallback } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Customer, WaitingQueueState } from "@/types";
import { toast } from "sonner";
import { subscribeToQueueChanges, updateCustomerStatus, removeCustomer } from "@/services/waitingQueueService";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [queueState, setQueueState] = useState<WaitingQueueState>({ customers: [], currentlyServing: null });
  const [activeTab, setActiveTab] = useState<'waiting' | 'called' | 'history' | 'priority'>('waiting');
  const [calledHistory, setCalledHistory] = useState<Customer[]>([]);

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
    
    // Prioriza clientes com preferências especiais
    const priorityCustomers = waitingCustomers.filter(c => 
      c.preferences.pregnant || c.preferences.elderly || c.preferences.disabled || c.preferences.infant
    );
    
    // Seleciona o próximo cliente (prioridade ou aguardando normal)
    const customersToConsider = activeTab === 'priority' && priorityCustomers.length > 0 
      ? priorityCustomers 
      : waitingCustomers;
    
    if (customersToConsider.length > 0) {
      // Sort by timestamp to get the longest waiting customer
      const sortedCustomers = [...customersToConsider].sort((a, b) => a.timestamp - b.timestamp);
      const nextCustomer = sortedCustomers[0];
      
      try {
        // Atualiza o status do cliente para "called"
        const called = await updateCustomerStatus(nextCustomer.id, "called");
        setCalledHistory(prev => [called, ...prev].slice(0, 50)); // Limita histórico a 50 entradas
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
  
  const handleFinishServing = async (id: string) => {
    try {
      const customer = queueState.customers.find(c => c.id === id);
      if (customer) {
        setCalledHistory(prev => [{...customer, status: 'seated'}, ...prev].slice(0, 50));
      }
      await removeCustomer(id);
      toast.success("Cliente atendido com sucesso!");
    } catch (error) {
      console.error("Erro ao finalizar atendimento:", error);
      toast.error("Erro ao finalizar atendimento. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
          onFinishServing={handleFinishServing}
          currentlyServing={queueState.currentlyServing}
          calledHistory={calledHistory}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
      )}
    </div>
  );
};

export default Admin;
