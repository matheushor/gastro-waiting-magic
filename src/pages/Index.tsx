
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RegistrationForm from "@/components/customer/RegistrationForm";
import WaitingList from "@/components/customer/WaitingList";
import { Customer, WaitingQueueState } from "@/types";
import NotificationAlert from "@/components/customer/NotificationAlert";
import { toast } from "sonner";
import { BellRing, ClipboardList, LogIn, Bell, MapPin, Home } from "lucide-react";
import { subscribeToQueueChanges, addCustomer, removeCustomer } from "@/services/waitingQueueService";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [queueState, setQueueState] = useState<WaitingQueueState>({ customers: [], currentlyServing: null });
  const [calledCustomer, setCalledCustomer] = useState<Customer | null>(null);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string>(() => {
    return localStorage.getItem('userPhoneNumber') || '';
  });
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Identificação do usuário pelo número de telefone (simulando autenticação)
  useEffect(() => {
    if (userPhoneNumber) {
      localStorage.setItem('userPhoneNumber', userPhoneNumber);
    }
  }, [userPhoneNumber]);
  
  useEffect(() => {
    try {
      const unsubscribe = subscribeToQueueChanges((newState) => {
        setQueueState(newState);
        
        // Verificar se existe algum cliente chamado com o número de telefone do usuário atual
        if (userPhoneNumber) {
          const userCalled = newState.customers.find(c => 
            c.status === 'called' && c.phone === userPhoneNumber
          );
          
          if (userCalled && (!calledCustomer || userCalled.id !== calledCustomer.id)) {
            setCalledCustomer(userCalled);
            
            // Enviar notificação apenas para este usuário
            toast(
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gastro-orange" />
                <div>
                  <p className="font-bold">Sua vez chegou!</p>
                  <p className="text-sm">Você foi chamado para sua mesa.</p>
                </div>
              </div>
            );
          }
        }
      });
      
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error("Error subscribing to queue changes:", error);
      setError("Erro ao carregar a fila. Por favor, atualize a página.");
    }
  }, [calledCustomer, userPhoneNumber]);

  const handleCustomerRegistration = async (newCustomer: Customer) => {
    try {
      // Salvar o número de telefone para identificação do usuário
      setUserPhoneNumber(newCustomer.phone);
      
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
      // Remover o cliente do banco diretamente quando confirma presença
      await removeCustomer(calledCustomer.id);
      
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
      // Remove o cliente quando o tempo expirar
      await removeCustomer(calledCustomer.id);
      
      toast.error("Tempo expirado. Você foi removido da fila.");
      
      setCalledCustomer(null);
    } catch (error) {
      console.error("Erro ao processar retorno à fila:", error);
      toast.error("Erro ao processar seu retorno à fila. Tente novamente.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gastro-blue mb-2">Oops! Algo deu errado</h2>
          <p className="text-gastro-gray mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gastro-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 relative">
      <div className={`mx-auto mb-8 ${isMobile ? 'max-w-full' : 'max-w-md'}`}>
        <div className="bg-gradient-to-r from-gastro-blue to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center">
            Quatro Gastro Burger
          </h1>
          <p className="text-center text-blue-100 mt-2 flex items-center justify-center gap-1">
            <MapPin className="h-4 w-4 text-gastro-orange" />
            <span>Sistema de Fila de Espera</span>
          </p>
          <div className="text-center text-xs text-blue-100 mt-1">
            R. Dr. José Guimarães, 758 - Jardim Irajá, Ribeirão Preto - SP, 14020-560
          </div>
        </div>
      </div>

      <Tabs defaultValue="waitingList" className={`mx-auto ${isMobile ? 'max-w-full' : 'max-w-md'}`}>
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-100 p-1 rounded-lg overflow-hidden">
          <TabsTrigger value="waitingList" className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gastro-blue data-[state=active]:shadow-sm rounded-md">
            <ClipboardList className="h-4 w-4" />
            <span>Fila de Espera</span>
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gastro-blue data-[state=active]:shadow-sm rounded-md">
            <LogIn className="h-4 w-4" />
            <span>Entrar na Fila</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="waitingList" className="animate-scale-in">
          <WaitingList 
            customers={queueState.customers || []} 
            onLeaveQueue={handleLeaveQueue}
            userPhoneNumber={userPhoneNumber}
          />
        </TabsContent>
        
        <TabsContent value="register" className="animate-scale-in">
          <RegistrationForm onRegister={handleCustomerRegistration} />
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Link 
          to="/admin" 
          className="inline-flex items-center text-gastro-blue hover:text-gastro-orange transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-blue-100"
        >
          <BellRing className="h-4 w-4 mr-2" />
          Acesso do Administrador
        </Link>
      </div>

      {calledCustomer && (
        <NotificationAlert 
          customer={calledCustomer}
          onConfirm={handleConfirmPresence}
          onTimeExpired={handleTimeExpired}
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

export default Index;
