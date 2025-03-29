
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RegistrationForm from "@/components/customer/RegistrationForm";
import WaitingList from "@/components/customer/WaitingList";
import { Customer, WaitingQueueState } from "@/types";
import { initialWaitingQueueState } from "@/utils/mockData";
import NotificationAlert from "@/components/customer/NotificationAlert";
import { toast } from "sonner";
import { BellRing, ClipboardList, LogIn, Bell } from "lucide-react";

const Index = () => {
  const [queueState, setQueueState] = useState<WaitingQueueState>(initialWaitingQueueState);
  const [calledCustomer, setCalledCustomer] = useState<Customer | null>(null);
  
  // Simulate real-time updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Randomly call a customer (for demo purposes)
      if (Math.random() < 0.1 && queueState.customers.length > 0 && !calledCustomer) {
        const waitingCustomers = queueState.customers.filter(c => c.status === "waiting");
        if (waitingCustomers.length > 0) {
          const randomIndex = Math.floor(Math.random() * waitingCustomers.length);
          const customerToCall = waitingCustomers[randomIndex];
          
          // Update customer status to called
          setQueueState(prev => ({
            ...prev,
            customers: prev.customers.map(c => 
              c.id === customerToCall.id ? { ...c, status: "called" } : c
            ),
            currentlyServing: { ...customerToCall, status: "called" }
          }));
          
          // Set the called customer to show notification
          setCalledCustomer({ ...customerToCall, status: "called" });
          
          // Show toast notification
          toast(
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gastro-orange" />
              <div>
                <p className="font-bold">Cliente chamado!</p>
                <p className="text-sm">Cliente {customerToCall.name} foi chamado.</p>
              </div>
            </div>
          );
        }
      }
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(intervalId);
  }, [queueState, calledCustomer]);

  const handleCustomerRegistration = (newCustomer: Customer) => {
    setQueueState(prev => ({
      ...prev,
      customers: [...prev.customers, newCustomer],
    }));
  };

  const handleLeaveQueue = (id: string) => {
    setQueueState(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id),
      currentlyServing: prev.currentlyServing?.id === id ? null : prev.currentlyServing,
    }));
    
    if (calledCustomer?.id === id) {
      setCalledCustomer(null);
    }
  };

  const handleConfirmPresence = () => {
    if (!calledCustomer) return;
    
    toast.success("Presença confirmada! Dirija-se ao balcão.");
    
    // Update customer status to seated
    setQueueState(prev => ({
      ...prev,
      customers: prev.customers.map(c => 
        c.id === calledCustomer.id ? { ...c, status: "seated" } : c
      ),
      currentlyServing: null,
    }));
    
    // Clear the notification
    setCalledCustomer(null);
  };

  const handleTimeExpired = () => {
    if (!calledCustomer) return;
    
    toast.error("Tempo expirado. Você voltou para a fila.");
    
    // Put the customer back in the queue
    setQueueState(prev => ({
      ...prev,
      customers: prev.customers.map(c => 
        c.id === calledCustomer.id ? { ...c, status: "waiting", timestamp: Date.now() } : c
      ),
      currentlyServing: null,
    }));
    
    // Clear the notification
    setCalledCustomer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center text-gastro-blue">
          4 Gastro Burger
        </h1>
        <p className="text-center text-gastro-gray mt-2">
          Sistema de Fila de Espera
        </p>
      </div>

      <Tabs defaultValue="waitingList" className="max-w-md mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="waitingList" className="flex items-center justify-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>Fila de Espera</span>
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center justify-center gap-2">
            <LogIn className="h-4 w-4" />
            <span>Entrar na Fila</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="waitingList">
          <WaitingList 
            customers={queueState.customers} 
            onLeaveQueue={handleLeaveQueue} 
          />
        </TabsContent>
        
        <TabsContent value="register">
          <RegistrationForm onRegister={handleCustomerRegistration} />
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <a 
          href="/admin" 
          className="inline-flex items-center text-gastro-blue hover:text-gastro-lightBlue transition-colors"
        >
          <BellRing className="h-4 w-4 mr-1" />
          Acesso do Administrador
        </a>
      </div>

      {calledCustomer && (
        <NotificationAlert 
          customer={calledCustomer}
          onConfirm={handleConfirmPresence}
          onTimeExpired={handleTimeExpired}
        />
      )}
    </div>
  );
};

export default Index;
