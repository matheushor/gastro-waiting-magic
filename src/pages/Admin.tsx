
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
  fetchDailyStatistics 
} from "@/services/waitingQueueService";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [queueState, setQueueState] = useState<WaitingQueueState>({ customers: [], currentlyServing: null });
  const [activeTab, setActiveTab] = useState<'waiting' | 'called' | 'history' | 'priority' | 'register'>('waiting');
  const [calledHistory, setCalledHistory] = useState<Customer[]>([]);
  const [queueCounts, setQueueCounts] = useState<{time: string, count: number}[]>([]);
  const [dailyStats, setDailyStats] = useState<{ groups: number, people: number }>({ groups: 0, people: 0 });

  // Fetch daily statistics
  useEffect(() => {
    if (isLoggedIn && activeTab === 'history') {
      const fetchStats = async () => {
        const stats = await fetchDailyStatistics();
        setDailyStats(stats);
      };
      fetchStats();
    }
  }, [isLoggedIn, activeTab]);

  // Inscreve-se para atualizações em tempo real quando logado
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const unsubscribe = subscribeToQueueChanges(newState => {
      setQueueState(newState);
      
      // Atualizar contagem de clientes a cada mudança
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const waitingCount = newState.customers.filter(c => c.status === 'waiting').length;
      
      setQueueCounts(prev => {
        // Limitamos o histórico para manter apenas os últimos 50 registros
        const newCounts = [...prev, { time: timeStr, count: waitingCount }];
        if (newCounts.length > 50) {
          return newCounts.slice(-50);
        }
        return newCounts;
      });
    });
    
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
        // Ensure we properly type the status as one of the allowed values
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
      
      // Refresh statistics when a new customer is registered
      if (isLoggedIn) {
        const stats = await fetchDailyStatistics();
        setDailyStats(stats);
      }
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error("Erro ao cadastrar cliente. Tente novamente.");
    }
  };

  // Calcula o tempo médio de espera atual
  const calculateAverageWaitTime = () => {
    const waitingCustomers = queueState.customers.filter(c => c.status === 'waiting');
    if (waitingCustomers.length <= 1) return null;
    
    const timestamps = waitingCustomers.map(c => c.timestamp).sort((a, b) => a - b);
    let totalDiff = 0;
    
    for (let i = 1; i < timestamps.length; i++) {
      totalDiff += timestamps[i] - timestamps[i-1];
    }
    
    const avgDiffMs = totalDiff / (timestamps.length - 1);
    return Math.ceil(avgDiffMs / 60000);
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
