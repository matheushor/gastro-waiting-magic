
import React, { useState, useEffect } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Customer, WaitingQueueState } from "@/types";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  subscribeToQueueChanges, 
  updateCustomer,
  removeCustomer, 
  addCustomer, 
  updateCustomerStatus,
  calculateAverageWaitTime
} from "@/services/waitingQueueService";
import { fetchDailyStatistics } from "@/services/waitingQueue/database";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [queueState, setQueueState] = useState<WaitingQueueState>({ customers: [], currentlyServing: null });
  const [activeTab, setActiveTab] = useState<'waiting' | 'called' | 'history' | 'priority' | 'register'>('waiting');
  const [calledHistory, setCalledHistory] = useState<Customer[]>([]);
  const [queueCounts, setQueueCounts] = useState<{time: string, count: number}[]>([]);
  const [dailyStatistics, setDailyStatistics] = useState<{date: string, groups_count: number, people_count: number}[]>([]);
  const isMobile = useIsMobile();

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
    
    return () => unsubscribe();
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && activeTab === 'history') {
      loadDailyStatistics();
    }
  }, [isLoggedIn, activeTab]);

  const loadDailyStatistics = async () => {
    try {
      const stats = await fetchDailyStatistics();
      setDailyStatistics(stats);
    } catch (error) {
      console.error("Erro ao carregar estatísticas diárias:", error);
      toast.error("Falha ao carregar estatísticas", {
        description: "Não foi possível carregar as estatísticas diárias. Tente novamente mais tarde."
      });
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    toast.success("Login realizado com sucesso!", {
      description: "Bem-vindo ao Painel Administrativo do Quatro Gastro Burger."
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.info("Logout realizado", {
      description: "Você saiu do sistema com sucesso."
    });
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
        
        // Enhanced notification
        toast.success(`${nextCustomer.name} foi chamado!`, {
          description: `${nextCustomer.partySize} ${nextCustomer.partySize > 1 ? 'pessoas' : 'pessoa'} • Tel: ${nextCustomer.phone}`,
          duration: 5000,
        });
      } catch (error) {
        console.error("Erro ao chamar próximo cliente:", error);
        toast.error("Erro ao chamar próximo cliente", {
          description: "Ocorreu um problema ao chamar o próximo cliente. Tente novamente."
        });
      }
    } else {
      toast.error("Fila vazia", {
        description: "Não há clientes na fila de espera no momento."
      });
    }
  };

  const handleRemoveCustomer = async (id: string) => {
    try {
      await removeCustomer(id);
      toast.success("Cliente removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
      toast.error("Erro ao remover cliente", {
        description: "Não foi possível remover o cliente. Tente novamente."
      });
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
      toast.success("Cliente atendido com sucesso!", {
        description: "O cliente foi marcado como atendido e removido da fila."
      });
    } catch (error) {
      console.error("Erro ao finalizar atendimento:", error);
      toast.error("Erro ao finalizar atendimento", {
        description: "Ocorreu um problema ao finalizar o atendimento. Tente novamente."
      });
    }
  };

  const handleRegisterCustomer = async (customer: Customer) => {
    try {
      await addCustomer(customer);
      setActiveTab('waiting');
      toast.success("Cliente cadastrado com sucesso!", {
        description: `${customer.name} foi adicionado à fila de espera.`
      });
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error("Erro ao cadastrar cliente", {
        description: "Não foi possível cadastrar o cliente. Verifique as informações e tente novamente."
      });
    }
  };

  const handleUpdateCustomer = async (customer: Customer) => {
    try {
      await updateCustomer(customer);
      toast.success("Cliente atualizado com sucesso!", {
        description: `As informações de ${customer.name} foram atualizadas.`
      });
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar cliente", {
        description: "Não foi possível atualizar as informações do cliente. Tente novamente."
      });
    }
  };

  const getAverageWaitTime = () => {
    return calculateAverageWaitTime(queueState.customers);
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
          onFinishServing={handleFinishServing}
          onUpdateCustomer={handleUpdateCustomer}
          onLogout={handleLogout}
          currentlyServing={queueState.currentlyServing}
          calledHistory={calledHistory}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          queueCounts={queueCounts}
          avgWaitTime={getAverageWaitTime()}
          onRegisterCustomer={handleRegisterCustomer}
          dailyStats={dailyStatistics}
          isMobile={isMobile}
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
