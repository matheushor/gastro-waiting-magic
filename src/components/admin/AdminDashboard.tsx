
import React, { useState } from "react";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, LogOut, History, Star, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import StatisticsCards from "./dashboard/StatisticsCards";
import CurrentCustomer from "./dashboard/CurrentCustomer";
import TabContent from "./dashboard/TabContent";

interface AdminDashboardProps {
  customers: Customer[];
  onCallNext: () => void;
  onRemoveCustomer: (id: string) => void;
  onFinishServing: (id: string) => void;
  onLogout: () => void;
  currentlyServing: Customer | null;
  calledHistory: Customer[];
  activeTab: 'waiting' | 'called' | 'history' | 'priority' | 'register';
  onChangeTab: (tab: 'waiting' | 'called' | 'history' | 'priority' | 'register') => void;
  queueCounts: {time: string, count: number}[];
  avgWaitTime: number | null;
  onRegisterCustomer: (customer: Customer) => void;
  dailyStats: { groups: number, people: number };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  customers,
  onCallNext,
  onRemoveCustomer,
  onFinishServing,
  onLogout,
  currentlyServing,
  calledHistory,
  activeTab,
  onChangeTab,
  queueCounts,
  avgWaitTime,
  onRegisterCustomer,
  dailyStats,
}) => {
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [customerToRemove, setCustomerToRemove] = useState<Customer | null>(null);

  const waitingCount = customers.filter(c => c.status === "waiting").length;

  const waitingCustomers = [...customers]
    .filter(c => c.status === "waiting")
    .sort((a, b) => a.timestamp - b.timestamp);
    
  const priorityCustomers = [...customers]
    .filter(c => 
      c.status === "waiting" && 
      (c.preferences.pregnant || c.preferences.elderly || c.preferences.disabled || c.preferences.infant)
    )
    .sort((a, b) => a.timestamp - b.timestamp);

  const handleRemoveClick = (customer: Customer) => {
    setCustomerToRemove(customer);
    setConfirmDialog(true);
  };

  const confirmRemove = () => {
    if (customerToRemove) {
      onRemoveCustomer(customerToRemove.id);
      setConfirmDialog(false);
    }
  };

  const renderPreferences = (customer: Customer) => {
    const { preferences } = customer;
    const activePreferences = [];
    
    if (preferences.pregnant) activePreferences.push("Gestante");
    if (preferences.elderly) activePreferences.push("Idoso");
    if (preferences.disabled) activePreferences.push("PCD");
    if (preferences.infant) activePreferences.push("Criança de colo");
    if (preferences.withDog) activePreferences.push("Com cachorro");
    if (preferences.indoor) activePreferences.push("Mesa interna");
    else activePreferences.push("Mesa externa");
    
    return activePreferences.map((pref, index) => (
      <span key={index} className="preference-tag">
        {pref}
      </span>
    ));
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gastro-blue">Painel Administrativo</h1>
          <p className="text-gastro-gray">Quatro Gastro Burger</p>
        </div>
        <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Button>
      </div>

      <StatisticsCards 
        waitingCount={waitingCount}
        avgWaitTime={avgWaitTime}
        onCallNext={onCallNext}
        currentlyServing={currentlyServing}
      />

      <CurrentCustomer 
        currentlyServing={currentlyServing}
        onFinishServing={onFinishServing}
        onRemoveCustomer={handleRemoveClick}
        renderPreferences={renderPreferences}
      />

      <Tabs defaultValue="waiting" value={activeTab} onValueChange={(val) => onChangeTab(val as any)}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="waiting" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Aguardando</span>
          </TabsTrigger>
          <TabsTrigger value="called" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Chamados</span>
          </TabsTrigger>
          <TabsTrigger value="priority" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>Prioritários</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            <span>Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            <span>Cadastrar</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <TabContent 
            activeTab={activeTab}
            waitingCustomers={waitingCustomers}
            priorityCustomers={priorityCustomers}
            currentlyServing={currentlyServing}
            calledHistory={calledHistory}
            onRemoveCustomer={handleRemoveClick}
            onFinishServing={onFinishServing}
            onRegisterCustomer={onRegisterCustomer}
            queueCounts={queueCounts}
            dailyStats={dailyStats}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar remoção</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja remover {customerToRemove?.name} da fila?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmRemove}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
