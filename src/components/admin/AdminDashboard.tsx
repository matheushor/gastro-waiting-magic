
import React, { useState } from "react";
import { Customer, DailyStatistics } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BellRing, History, Star, UserPlus } from "lucide-react";
import { toast } from "sonner";
import AdminRegistrationForm from "./AdminRegistrationForm";
import EditCustomerDialog from "./EditCustomerDialog";
import { calculateAverageWaitTime } from "@/services/waitingQueue/operations";
import CustomerListTab from "./CustomerListTab";
import DashboardStats from "./DashboardStats";
import CurrentCustomer from "./CurrentCustomer";
import HistoryTab from "./HistoryTab";
import ConfirmationDialog from "./ConfirmationDialog";

interface AdminDashboardProps {
  customers: Customer[];
  onCallNext: () => void;
  onRemoveCustomer: (id: string) => void;
  onFinishServing: (id: string) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onLogout: () => void;
  currentlyServing: Customer | null;
  calledHistory: Customer[];
  activeTab: 'waiting' | 'called' | 'history' | 'priority' | 'register';
  onChangeTab: (tab: 'waiting' | 'called' | 'history' | 'priority' | 'register') => void;
  queueCounts: {time: string, count: number}[];
  avgWaitTime: number | null;
  onRegisterCustomer: (customer: Customer) => void;
  dailyStats: DailyStatistics[];
  isMobile: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  customers,
  onCallNext,
  onRemoveCustomer,
  onFinishServing,
  onUpdateCustomer,
  onLogout,
  currentlyServing,
  calledHistory,
  activeTab,
  onChangeTab,
  queueCounts,
  avgWaitTime,
  onRegisterCustomer,
  dailyStats,
  isMobile,
}) => {
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [customerToRemove, setCustomerToRemove] = useState<Customer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [confirmAction, setConfirmAction] = useState<"remove" | "finish" | null>(null);

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

  const realAvgWaitTime = calculateAverageWaitTime(customers);

  const handleRemoveClick = (customer: Customer) => {
    setCustomerToRemove(customer);
    setConfirmAction("remove");
    setConfirmDialog(true);
  };

  const handleFinishServingClick = (customer: Customer) => {
    setCustomerToRemove(customer);
    setConfirmAction("finish");
    setConfirmDialog(true);
  };

  const confirmRemove = () => {
    if (!customerToRemove) return;
    
    if (confirmAction === "remove") {
      onRemoveCustomer(customerToRemove.id);
      toast.success("Cliente removido com sucesso!", {
        description: `${customerToRemove.name} foi removido da fila.`
      });
    } else if (confirmAction === "finish") {
      onFinishServing(customerToRemove.id);
      toast.success("Cliente atendido com sucesso!", {
        description: `${customerToRemove.name} foi marcado como atendido.`
      });
    }
    
    setCustomerToRemove(null);
    setConfirmAction(null);
  };

  const handleEditClick = (customer: Customer) => {
    setCustomerToEdit(customer);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedCustomer: Customer) => {
    onUpdateCustomer(updatedCustomer);
    setEditDialogOpen(false);
    toast.success("Cliente atualizado com sucesso!", {
      description: `Informações de ${updatedCustomer.name} foram atualizadas.`
    });
  };

  const handleCallNextWithNotification = () => {
    const waitingCustomers = customers.filter(c => c.status === "waiting");
    
    if (waitingCustomers.length === 0) {
      toast.error("Não há clientes na fila de espera.");
      return;
    }
    
    onCallNext();
  };

  return (
    <div className={`mx-auto p-4 ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>
      <DashboardStats 
        waitingCount={waitingCount}
        avgWaitTime={realAvgWaitTime} 
        onCallNext={handleCallNextWithNotification}
        onLogout={onLogout}
        currentlyServing={!!currentlyServing}
        isMobile={isMobile}
      />

      {currentlyServing && (
        <CurrentCustomer 
          currentlyServing={currentlyServing}
          onEdit={handleEditClick}
          onFinishServing={(id) => handleFinishServingClick(customers.find(c => c.id === id)!)}
          onRemove={handleRemoveClick}
        />
      )}

      <Tabs defaultValue="waiting" value={activeTab} onValueChange={(val) => onChangeTab(val as any)}>
        <TabsList className={`grid mb-4 overflow-x-auto flex-nowrap ${isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}>
          <TabsTrigger value="waiting" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Aguardando</span>
          </TabsTrigger>
          <TabsTrigger value="called" className="flex items-center gap-1">
            <BellRing className="h-4 w-4" />
            <span>Chamados</span>
          </TabsTrigger>
          <TabsTrigger value="priority" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>Prioritários</span>
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="history" className="flex items-center gap-1">
                <History className="h-4 w-4" />
                <span>Histórico</span>
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                <span>Cadastrar</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>
        
        {isMobile && (
          <TabsList className="grid grid-cols-2 mb-4 overflow-x-auto flex-nowrap">
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              <span>Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              <span>Cadastrar</span>
            </TabsTrigger>
          </TabsList>
        )}
        
        <TabsContent value="waiting">
          <CustomerListTab 
            title="Fila de Espera"
            customers={waitingCustomers}
            onEdit={handleEditClick}
            onRemove={handleRemoveClick}
            emptyMessage="Não há clientes na fila no momento."
            isMobile={isMobile}
          />
        </TabsContent>
        
        <TabsContent value="called">
          {currentlyServing ? (
            <CustomerListTab 
              title="Clientes Chamados"
              customers={[currentlyServing]}
              onEdit={handleEditClick}
              onRemove={handleRemoveClick}
              onFinishServing={onFinishServing}
              emptyMessage="Nenhum cliente sendo chamado no momento."
              isMobile={isMobile}
            />
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gastro-blue mb-3">Clientes Chamados</h2>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gastro-gray">Nenhum cliente sendo chamado no momento.</p>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="priority">
          <CustomerListTab 
            title="Clientes Prioritários"
            customers={priorityCustomers}
            onEdit={handleEditClick}
            onRemove={handleRemoveClick}
            isPriority={true}
            emptyMessage="Não há clientes prioritários na fila."
            isMobile={isMobile}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <HistoryTab 
            dailyStats={dailyStats}
            queueCounts={queueCounts}
            realAvgWaitTime={realAvgWaitTime}
            isMobile={isMobile}
          />
        </TabsContent>
        
        <TabsContent value="register">
          <h2 className="text-xl font-bold text-gastro-blue mb-3">Cadastrar Cliente</h2>
          <AdminRegistrationForm onRegister={onRegisterCustomer} />
        </TabsContent>
      </Tabs>

      <ConfirmationDialog 
        open={confirmDialog}
        onOpenChange={setConfirmDialog}
        title={confirmAction === "remove" ? "Confirmar remoção" : "Confirmar atendimento"}
        message={
          confirmAction === "remove" 
            ? `Tem certeza que deseja remover ${customerToRemove?.name} da fila?` 
            : `Confirmar que ${customerToRemove?.name} foi atendido?`
        }
        confirmText={confirmAction === "remove" ? "Remover" : "Confirmar"}
        cancelText="Cancelar"
        onConfirm={confirmRemove}
        customer={customerToRemove || undefined}
        variant={confirmAction === "remove" ? "destructive" : "default"}
      />
      
      {customerToEdit && (
        <EditCustomerDialog 
          customer={customerToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
