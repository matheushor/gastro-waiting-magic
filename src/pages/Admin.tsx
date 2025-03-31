
import React, { useState, useEffect } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Customer, WaitingQueueState } from "@/types";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { 
  subscribeToQueueChanges, 
  updateCustomerStatus, 
  removeCustomer, 
  addCustomer, 
  updateCustomerInfo, 
  fetchDailyStatistics 
} from "@/services/waitingQueueService";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [queueState, setQueueState] = useState<WaitingQueueState>({ customers: [], currentlyServing: null });
  const [activeTab, setActiveTab] = useState<'waiting' | 'called' | 'history' | 'priority' | 'register'>('waiting');
  const [calledHistory, setCalledHistory] = useState<Customer[]>([]);
  const [queueCounts, setQueueCounts] = useState<{time: string, count: number}[]>([]);
  const [dailyStats, setDailyStats] = useState<{date: string, groups_count: number, people_count: number}[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    
    const unsubscribe = subscribeToQueueChanges(newState => {
      setQueueState(newState);
      
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const waitingCount = newState.customers.filter(c => c.status === 'waiting').length;
      
      setQueueCounts(prev => {
        const newCounts = [...prev, { time: timeStr, count: waitingCount }];
        if (newCounts.length > 50) {
          return newCounts.slice(-50);
        }
        return newCounts;
      });
    });
    
    const loadDailyStats = async () => {
      const stats = await fetchDailyStatistics(7);
      setDailyStats(stats.reverse());
    };
    
    loadDailyStats();
    
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
    
    const priorityCustomers = waitingCustomers.filter(c => 
      c.preferences.pregnant || c.preferences.elderly || c.preferences.disabled || c.preferences.infant
    );
    
    const customersToConsider = activeTab === 'priority' && priorityCustomers.length > 0 
      ? priorityCustomers 
      : waitingCustomers;
    
    if (customersToConsider.length > 0) {
      const sortedCustomers = [...customersToConsider].sort((a, b) => a.timestamp - b.timestamp);
      const nextCustomer = sortedCustomers[0];
      
      try {
        const called = await updateCustomerStatus(nextCustomer.id, "called");
        setCalledHistory(prev => [called, ...prev].slice(0, 50));
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
        const seatedCustomer: Customer = {
          ...customer,
          status: "seated" as const
        };
        setCalledHistory(prev => [seatedCustomer, ...prev].slice(0, 50));
      }
      await removeCustomer(id);
      toast.success("Cliente atendido com sucesso!");
    } catch (error) {
      console.error("Erro ao finalizar atendimento:", error);
      toast.error("Erro ao finalizar atendimento. Tente novamente.");
    }
  };

  const handleRegisterCustomer = async (customer: Customer) => {
    try {
      await addCustomer(customer);
      setActiveTab('waiting');
      toast.success("Cliente cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error("Erro ao cadastrar cliente. Tente novamente.");
    }
  };

  const handleUpdateCustomer = async (id: string, updatedCustomer: Partial<Customer>) => {
    try {
      await updateCustomerInfo(id, updatedCustomer);
      toast.success("Informações do cliente atualizadas com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar informações do cliente. Tente novamente.");
    }
  };

  const calculateAverageWaitTime = () => {
    // Get customers who have been called and have both timestamp and calledAt
    const calledCustomers = queueState.customers
      .filter(c => c.status === 'called' && c.calledAt && c.timestamp)
      .concat(calledHistory.filter(c => c.calledAt && c.timestamp));
    
    if (calledCustomers.length === 0) return null;
    
    let totalWaitTime = 0;
    let count = 0;
    
    calledCustomers.forEach(customer => {
      if (customer.calledAt && customer.timestamp) {
        const waitTime = customer.calledAt - customer.timestamp;
        if (waitTime > 0) {
          totalWaitTime += waitTime;
          count++;
        }
      }
    });
    
    if (count === 0) return null;
    
    // Return average wait time in minutes
    return Math.ceil(totalWaitTime / count / 60000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative">
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
          queueCounts={queueCounts}
          avgWaitTime={calculateAverageWaitTime()}
          onRegisterCustomer={handleRegisterCustomer}
          onUpdateCustomer={handleUpdateCustomer}
          dailyStats={dailyStats}
        />
      )}

      <div className="fixed bottom-4 right-4 z-10">
        <Link to="/" className="bg-white p-3 rounded-full shadow-lg border border-blue-100 flex items-center justify-center hover:bg-blue-50 transition-colors">
          <Home className="h-5 w-5 text-gastro-blue" />
        </Link>
      </div>
    </div>
  );
};

export default Admin;
