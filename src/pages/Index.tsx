
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RegistrationForm from "@/components/customer/RegistrationForm";
import WaitingList from "@/components/customer/WaitingList";
import { Customer, WaitingQueueState } from "@/types";
import NotificationAlert from "@/components/customer/NotificationAlert";
import { toast } from "sonner";
import { BellRing, ClipboardList, LogIn, Bell, MapPin, AlertCircle, Home } from "lucide-react";
import { subscribeToQueueChanges, addCustomer, removeCustomer } from "@/services/waitingQueueService";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [queueState, setQueueState] = useState<WaitingQueueState>({ customers: [], currentlyServing: null });
  const [calledCustomer, setCalledCustomer] = useState<Customer | null>(null);
  const [userPhone, setUserPhone] = useState<string>(() => localStorage.getItem('userPhone') || '');
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  
  useEffect(() => {
    const unsubscribe = subscribeToQueueChanges((newState) => {
      setQueueState(newState);
      
      // Check if there's a customer with matching phone being called
      if (userPhone) {
        const matchingCustomer = newState.customers.find(c => 
          c.status === 'called' && 
          c.phone === userPhone &&
          (!calledCustomer || c.id !== calledCustomer.id)
        );
        
        if (matchingCustomer) {
          setCalledCustomer(matchingCustomer);
          
          toast(
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gastro-orange" />
              <div>
                <p className="font-bold">Cliente chamado!</p>
                <p className="text-sm">Olá {matchingCustomer.name}, sua vez chegou!</p>
              </div>
            </div>
          );
        }
      }
    });
    
    // If no phone saved, ask for it
    if (!userPhone) {
      setPhoneDialogOpen(true);
    }
    
    return () => unsubscribe();
  }, [userPhone, calledCustomer]);

  const handleCustomerRegistration = async (newCustomer: Customer) => {
    try {
      await addCustomer(newCustomer);
      
      // Save user phone for notifications
      setUserPhone(newCustomer.phone);
      localStorage.setItem('userPhone', newCustomer.phone);
      
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
  
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    
    // Format phone number: (99) 99999-9999
    let formattedValue = "";
    if (value.length <= 2) {
      formattedValue = value;
    } else if (value.length <= 7) {
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length <= 11) {
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else {
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
    }
    
    setPhoneInput(formattedValue);
  };
  
  const savePhoneNumber = () => {
    const cleanPhone = phoneInput.replace(/\D/g, "");
    if (cleanPhone.length >= 8) {
      setUserPhone(cleanPhone);
      localStorage.setItem('userPhone', cleanPhone);
      setPhoneDialogOpen(false);
    } else {
      toast.error("Por favor, digite um número de telefone válido");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 relative">
      <div className="max-w-md mx-auto mb-8">
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

      <Tabs defaultValue="waitingList" className="max-w-md mx-auto">
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
            customers={queueState.customers} 
            onLeaveQueue={handleLeaveQueue} 
          />
        </TabsContent>
        
        <TabsContent value="register" className="animate-scale-in">
          <RegistrationForm onRegister={handleCustomerRegistration} />
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <a 
          href="/admin" 
          className="inline-flex items-center text-gastro-blue hover:text-gastro-orange transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-blue-100"
        >
          <BellRing className="h-4 w-4 mr-2" />
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
      
      <div className="fixed bottom-4 right-4 z-10">
        <Link to="/" className="bg-white p-3 rounded-full shadow-lg border border-blue-100 flex items-center justify-center hover:bg-blue-50 transition-colors">
          <Home className="h-5 w-5 text-gastro-blue" />
        </Link>
      </div>
      
      <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Digite seu telefone para receber notificações</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Para receber notificações quando sua vez chegar, precisamos do seu número de telefone.
            </p>
            <Input
              placeholder="(99) 99999-9999"
              value={phoneInput}
              onChange={handlePhoneInput}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPhoneDialogOpen(false)}>
              Depois
            </Button>
            <Button type="button" onClick={savePhoneNumber}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
