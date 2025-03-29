
import React, { useState, useEffect } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { WaitingQueueState } from "@/types";
import { initialWaitingQueueState } from "@/utils/mockData";
import { toast } from "sonner";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [queueState, setQueueState] = useState<WaitingQueueState>(initialWaitingQueueState);

  const handleLogin = () => {
    setIsLoggedIn(true);
    toast.success("Login realizado com sucesso!");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleCallNext = () => {
    const waitingCustomers = queueState.customers.filter(c => c.status === "waiting");
    
    if (waitingCustomers.length > 0) {
      // Sort by timestamp to get the longest waiting customer
      const sortedCustomers = [...waitingCustomers].sort((a, b) => a.timestamp - b.timestamp);
      const nextCustomer = sortedCustomers[0];
      
      // Update customer status
      setQueueState(prev => ({
        ...prev,
        customers: prev.customers.map(c => 
          c.id === nextCustomer.id ? { ...c, status: "called" } : c
        ),
        currentlyServing: { ...nextCustomer, status: "called" }
      }));
      
      toast.success(`${nextCustomer.name} foi chamado!`);
    } else {
      toast.error("Não há clientes na fila de espera.");
    }
  };

  const handleRemoveCustomer = (id: string) => {
    setQueueState(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id),
      currentlyServing: prev.currentlyServing?.id === id ? null : prev.currentlyServing
    }));
  };

  // Simulate real-time updates
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const intervalId = setInterval(() => {
      // Randomly add a new customer (for demo purposes)
      if (Math.random() < 0.2) {
        const names = ["Carlos Silva", "Ana Oliveira", "Pedro Santos", "Juliana Lima", "Marcos Souza"];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomPhone = "119" + Math.floor(Math.random() * 10000000).toString().padStart(8, '0');
        const randomPartySize = Math.floor(Math.random() * 6) + 1;
        
        const newCustomer = {
          id: Math.random().toString(36).substring(2, 9),
          name: randomName,
          phone: randomPhone,
          partySize: randomPartySize,
          preferences: {
            pregnant: Math.random() < 0.1,
            elderly: Math.random() < 0.2,
            disabled: Math.random() < 0.1,
            infant: Math.random() < 0.2,
            withDog: Math.random() < 0.1,
            indoor: Math.random() < 0.7,
          },
          timestamp: Date.now(),
          status: "waiting",
        };
        
        setQueueState(prev => ({
          ...prev,
          customers: [...prev.customers, newCustomer],
        }));
        
        toast(
          <div>
            <p className="font-bold">Novo cliente!</p>
            <p className="text-sm">{randomName} entrou na fila</p>
          </div>
        );
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [isLoggedIn]);

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
