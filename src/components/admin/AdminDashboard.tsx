
import React, { useState } from "react";
import { Customer, DailyStatistics } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellRing, Users, Clock, LogOut, UserCheck, X, History, Star, Coffee, UserPlus, Edit, BarChart } from "lucide-react";
import { formatWaitingTime } from "@/utils/geoUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import AdminRegistrationForm from "./AdminRegistrationForm";
import EditCustomerDialog from "./EditCustomerDialog";
import { calculateAverageWaitTime } from "@/services/waitingQueue/operations";

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
    setConfirmDialog(true);
  };

  const confirmRemove = () => {
    if (customerToRemove) {
      onRemoveCustomer(customerToRemove.id);
      setConfirmDialog(false);
    }
  };

  const handleEditClick = (customer: Customer) => {
    setCustomerToEdit(customer);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedCustomer: Customer) => {
    onUpdateCustomer(updatedCustomer);
    setEditDialogOpen(false);
    toast.success("Cliente atualizado com sucesso!");
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
    if (preferences.outdoor) activePreferences.push("Mesa externa");
    
    return activePreferences.map((pref, index) => (
      <span key={index} className="preference-tag">
        {pref}
      </span>
    ));
  };

  const handleFinishServingClick = (customer: Customer) => {
    onFinishServing(customer.id);
  };

  return (
    <div className={`mx-auto p-4 ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>
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

      <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        <div className="bg-gastro-blue text-white p-6 rounded-lg shadow-md flex items-center">
          <Users className="h-10 w-10 mr-4" />
          <div>
            <h2 className="text-3xl font-bold">{waitingCount}</h2>
            <p className="text-sm">Clientes na fila</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <Clock className="h-10 w-10 mr-4 text-gastro-orange" />
          <div>
            <h2 className="text-3xl font-bold text-gastro-blue">
              {realAvgWaitTime ? `${realAvgWaitTime}m` : "-"}
            </h2>
            <p className="text-sm text-gastro-gray">Tempo médio de espera</p>
          </div>
        </div>
        
        <div>
          <Button 
            onClick={onCallNext} 
            disabled={waitingCount === 0 || currentlyServing !== null}
            className="h-full w-full bg-gastro-orange hover:bg-orange-600 text-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center"
          >
            <BellRing className="h-10 w-10 mb-2" />
            <span className="text-lg font-semibold">Chamar Próximo</span>
          </Button>
        </div>
      </div>

      {currentlyServing && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gastro-blue mb-3 flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Cliente Atual
          </h2>
          <div className="bg-orange-50 border border-gastro-orange p-4 rounded-lg">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <h3 className="font-semibold text-lg">{currentlyServing.name}</h3>
                <div className="flex items-center text-sm text-gastro-gray flex-wrap">
                  <span className="mr-2">{currentlyServing.partySize} {currentlyServing.partySize > 1 ? 'pessoas' : 'pessoa'}</span>
                  •
                  <span className="ml-2">Tel: {currentlyServing.phone}</span>
                </div>
                <div className="mt-2">
                  {renderPreferences(currentlyServing)}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditClick(currentlyServing)}
                  className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleFinishServingClick(currentlyServing)}
                  className="flex items-center gap-1 border-green-500 text-green-600 hover:bg-green-50"
                >
                  <Coffee className="h-4 w-4" />
                  <span>Atendido</span>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleRemoveClick(currentlyServing)}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  <span>Remover</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
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
          <h2 className="text-xl font-bold text-gastro-blue mb-3">Fila de Espera</h2>
          
          {waitingCustomers.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gastro-gray">Não há clientes na fila no momento.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {waitingCustomers.map((customer, index) => (
                <CustomerCard 
                  key={customer.id} 
                  customer={customer} 
                  position={index + 1}
                  onRemove={() => handleRemoveClick(customer)}
                  onEdit={() => handleEditClick(customer)}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="called">
          <h2 className="text-xl font-bold text-gastro-blue mb-3">Clientes Chamados</h2>
          
          {!currentlyServing ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gastro-gray">Nenhum cliente sendo chamado no momento.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <CustomerCard 
                key={currentlyServing.id} 
                customer={currentlyServing} 
                position={0}
                onRemove={() => handleRemoveClick(currentlyServing)}
                onFinishServing={() => handleFinishServingClick(currentlyServing)}
                onEdit={() => handleEditClick(currentlyServing)}
                isMobile={isMobile}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="priority">
          <h2 className="text-xl font-bold text-gastro-blue mb-3">Clientes Prioritários</h2>
          
          {priorityCustomers.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gastro-gray">Não há clientes prioritários na fila.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {priorityCustomers.map((customer, index) => (
                <CustomerCard 
                  key={customer.id} 
                  customer={customer} 
                  position={index + 1}
                  onRemove={() => handleRemoveClick(customer)}
                  onEdit={() => handleEditClick(customer)}
                  isPriority
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <h2 className="text-xl font-bold text-gastro-blue mb-3">Histórico do Dia</h2>
          
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="font-semibold text-gastro-blue mb-3 flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Estatísticas da Fila
            </h3>
            <div className={`grid gap-4 mb-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-gastro-blue mb-1">Clientes Hoje</h4>
                <p className="text-2xl font-bold text-gastro-blue">
                  {dailyStats[0]?.groups_count || 0} <span className="text-sm font-normal text-gastro-gray">grupos</span>
                </p>
                <p className="text-sm text-gastro-gray">
                  ({dailyStats[0]?.people_count || 0} pessoas no total)
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <h4 className="text-sm font-medium text-gastro-orange mb-1">Tempo Médio de Espera</h4>
                <p className="text-2xl font-bold text-gastro-orange">
                  {realAvgWaitTime ? `${realAvgWaitTime}m` : "-"}
                </p>
                <p className="text-sm text-gastro-gray">
                  Baseado em {customers.filter(c => c.status === "called" && c.calledAt).length} atendimentos
                </p>
              </div>
            </div>
            
            <div className="relative h-40">
              {queueCounts.length > 0 ? (
                <svg className="w-full h-full" viewBox={`0 0 ${queueCounts.length * 15} 100`} preserveAspectRatio="none">
                  <line 
                    x1="0" 
                    y1="90" 
                    x2={queueCounts.length * 15} 
                    y2="90" 
                    stroke="#ddd" 
                    strokeWidth="1" 
                  />
                  {[...Array(5)].map((_, i) => (
                    <line 
                      key={i}
                      x1="0" 
                      y1={90 - (i+1) * 15} 
                      x2={queueCounts.length * 15} 
                      y2={90 - (i+1) * 15} 
                      stroke="#eee" 
                      strokeWidth="1" 
                    />
                  ))}
                  <polyline 
                    points={queueCounts.map((point, index) => 
                      `${index * 15}, ${Math.max(10, 90 - point.count * 10)}`
                    ).join(' ')} 
                    fill="none" 
                    stroke="#3B82F6" 
                    strokeWidth="2" 
                  />
                  {queueCounts.map((point, index) => (
                    <circle 
                      key={index}
                      cx={index * 15} 
                      cy={Math.max(10, 90 - point.count * 10)} 
                      r="3" 
                      fill="#3B82F6" 
                    />
                  ))}
                </svg>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gastro-gray">
                  Sem dados disponíveis
                </div>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gastro-gray">
              {queueCounts.length > 0 && (
                <>
                  <div>{queueCounts[0].time}</div>
                  {queueCounts.length > 1 && (
                    <div>{queueCounts[queueCounts.length - 1].time}</div>
                  )}
                </>
              )}
            </div>
          </div>
          
          <h3 className="font-semibold text-gastro-blue my-3">Histórico dos Últimos Dias</h3>
          
          {dailyStats.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gastro-gray">Nenhuma estatística disponível.</p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gastro-gray uppercase tracking-wider">Data</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gastro-gray uppercase tracking-wider">Grupos</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gastro-gray uppercase tracking-wider">Pessoas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dailyStats.map((stat, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                        <td className="px-4 py-2 text-sm text-gastro-gray">{new Date(stat.date).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gastro-blue">{stat.groups_count}</td>
                        <td className="px-4 py-2 text-sm text-gastro-gray">{stat.people_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="register">
          <h2 className="text-xl font-bold text-gastro-blue mb-3">Cadastrar Cliente</h2>
          <AdminRegistrationForm onRegister={onRegisterCustomer} />
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

const CustomerCard = ({ 
  customer, 
  position, 
  onRemove, 
  onEdit,
  onFinishServing, 
  isPriority,
  isMobile 
}: { 
  customer: Customer;
  position: number;
  onRemove: () => void;
  onEdit: () => void;
  onFinishServing?: () => void;
  isPriority?: boolean;
  isMobile?: boolean;
}) => {
  const { preferences } = customer;
  const activePreferences = [];
  
  if (preferences.pregnant) activePreferences.push("Gestante");
  if (preferences.elderly) activePreferences.push("Idoso");
  if (preferences.disabled) activePreferences.push("PCD");
  if (preferences.infant) activePreferences.push("Criança de colo");
  if (preferences.withDog) activePreferences.push("Com cachorro");
  if (preferences.indoor) activePreferences.push("Mesa interna");
  if (preferences.outdoor) activePreferences.push("Mesa externa");
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${isPriority ? 'border-l-4 border-gastro-orange' : ''}`}>
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="flex items-center">
            <div className={`${
              customer.status === "called" 
                ? "bg-gastro-orange" 
                : "bg-gastro-blue"
            } text-white h-6 w-6 rounded-full flex items-center justify-center text-sm mr-2`}>
              {position}
            </div>
            <h3 className="font-semibold">{customer.name}</h3>
            {isPriority && (
              <span className="ml-2 bg-orange-100 text-gastro-orange text-xs px-2 py-0.5 rounded-full">
                Prioritário
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gastro-gray mt-1 flex-wrap">
            <span className="mr-2">{customer.partySize} {customer.partySize > 1 ? 'pessoas' : 'pessoa'}</span>
            •
            <span className="mx-2">Tel: {customer.phone}</span>
            •
            <Clock className="h-3 w-3 mx-1" />
            <span className="waiting-time">
              {formatWaitingTime(customer.timestamp)}
            </span>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-1">
            {activePreferences.map((pref, index) => (
              <span key={index} className="preference-tag inline-block bg-blue-50 text-gastro-blue text-xs px-2 py-1 rounded-full mr-1 mb-1">
                {pref}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
          {onFinishServing && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onFinishServing}
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <Coffee className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
