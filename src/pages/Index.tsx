import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RegistrationForm from "@/components/customer/RegistrationForm";
import WaitingList from "@/components/customer/WaitingList";
import { Customer, WaitingQueueState } from "@/types";
import NotificationAlert from "@/components/customer/NotificationAlert";
import { toast } from "sonner";
import { BellRing, ClipboardList, LogIn, Bell } from "lucide-react";
import { subscribeToQueueChanges, addCustomer, updateCustomerStatus, removeCustomer } from "@/services/waitingQueueService";

const Index = () => {
  const [queueState, setQueueState] = useState<WaitingQueueState>({ customers: [], currentlyServing: null });
  const [calledCustomer, setCalledCustomer] = useState<Customer | null>(null);
  
  useEffect(() => {
    const unsubscribe = subscribeToQueueChanges((newState) => {
      setQueueState(newState);
      
      const newCalled = newState.customers.find(c => 
        c.status === 'called' && 
        (!calledCustomer || c.id !== calledCustomer.id)
      );
      
      if (newCalled && !calledCustomer) {
        setCalledCustomer(newCalled);
        
        toast(
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gastro-orange" />
            <div>
              <p className="font-bold">Cliente chamado!</p>
              <p className="text-sm">Cliente {newCalled.name} foi chamado.</p>
            </div>
          </div>
        );
      }
    });
    
    return () => unsubscribe();
  }, [calledCustomer]);

  const handleCustomerRegistration = async (newCustomer: Customer) => {
    try {
      await addCustomer(newCustomer);
      toast.success("Cadastro realizado com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar cliente:", error);
      toast.error("Erro ao registrar cliente. Tente novamente.");
    }
  };

  const handleLeaveQueue = async (id: string) => {
    try {
      await removeCustomer(id);
      
      if (calledCustomer?.id === id) {
        setCalledCustomer(null);
      }
      
      toast.success("Você saiu da fila com sucesso!");
    } catch (error) {
      console.error("Erro ao sair da fila:", error);
      toast.error("Erro ao sair da fila. Tente novamente.");
    }
  };

  const handleConfirmPresence = async () => {
    if (!calledCustomer) return;
    
    try {
      await updateCustomerStatus(calledCustomer.id, 'seated');
      
      toast.success("Presença confirmada! Dirija-se ao balcão.");
      
      setCalledCustomer(null);
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
      toast.error("Erro ao confirmar presença. Tente novamente.");
    }
  };

  const handleTimeExpired = async () => {
    if (!calledCustomer) return;
    
    try {
      await updateCustomerStatus(calledCustomer.id, 'waiting');
      
      toast.error("Tempo expirado. Você voltou para a fila.");
      
      setCalledCustomer(null);
    } catch (error) {
      console.error("Erro ao retornar para a fila:", error);
      toast.error("Erro ao processar seu retorno à fila. Tente novamente.");
    }
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
