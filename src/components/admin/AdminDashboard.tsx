import React, { useState } from "react";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellRing, Users, Clock, LogOut, UserCheck, X, History, Star, User, Coffee, UserPlus, Group, Calendar } from "lucide-react";
import { formatWaitingTime } from "@/utils/geoUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import AdminRegistrationForm from "./AdminRegistrationForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

  const handleFinishServingClick = (customer: Customer) => {
    onFinishServing(customer.id);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              {avgWaitTime ? `${avgWaitTime}m` : "-"}
            </h2>
            <p className="text-sm text-gastro-gray">Tempo médio por cliente</p>
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
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{currentlyServing.name}</h3>
                <div className="flex items-center text-sm text-gastro-gray">
                  <span className="mr-2">{currentlyServing.partySize} {currentlyServing.partySize > 1 ? 'pessoas' : 'pessoa'}</span>
                  •
                  <span className="ml-2">Tel: {currentlyServing.phone}</span>
                </div>
                <div className="mt-2">
                  {renderPreferences(currentlyServing)}
                </div>
              </div>
              <div className="flex gap-2">
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
        <TabsList className="grid grid-cols-5 mb-4">
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
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            <span>Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            <span>Cadastrar</span>
          </TabsTrigger>
        </TabsList>
        
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
                  isPriority
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <h2 className="text-xl font-bold text-gastro-blue mb-3">Histórico do Dia</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-gastro-blue mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gastro-orange" />
                Estatísticas do Dia
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="flex items-center">
                      <Group className="h-4 w-4 mr-2 text-gastro-blue" />
                      Grupos atendidos
                    </TableCell>
                    <TableCell className="text-right font-semibold">{dailyStats.groups}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gastro-blue" />
                      Total de pessoas
                    </TableCell>
                    <TableCell className="text-right font-semibold">{dailyStats.people}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-gastro-blue mb-3">Tendência da Fila</h3>
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
          </div>
          
          {calledHistory.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gastro-gray">Nenhum histórico de atendimento disponível hoje.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {calledHistory.map((customer) => (
                <div key={customer.id + customer.timestamp} className="bg-white p-4 rounded-lg shadow-md opacity-80">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      <div className="flex items-center text-sm text-gastro-gray mt-1">
                        <span className="mr-2">{customer.partySize} {customer.partySize > 1 ? 'pessoas' : 'pessoa'}</span>
                        •
                        <span className="mx-2">Tel: {customer.phone}</span>
                        •
                        <span className="mx-2">Status: {customer.status === 'seated' ? 'Atendido' : 'Chamado'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
    </div>
  );
};

const CustomerCard = ({ 
  customer, 
  position, 
  onRemove, 
  onFinishServing, 
  isPriority 
}: { 
  customer: Customer;
  position: number;
  onRemove: () => void;
  onFinishServing?: () => void;
  isPriority?: boolean;
}) => {
  const { preferences } = customer;
  const activePreferences = [];
  
  if (preferences.pregnant) activePreferences.push("Gestante");
  if (preferences.elderly) activePreferences.push("Idoso");
  if (preferences.disabled) activePreferences.push("PCD");
  if (preferences.infant) activePreferences.push("Criança de colo");
  if (preferences.withDog) activePreferences.push("Com cachorro");
  if (preferences.indoor) activePreferences.push("Mesa interna");
  else activePreferences.push("Mesa externa");
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${isPriority ? 'border-l-4 border-gastro-orange' : ''}`}>
      <div className="flex justify-between items-start">
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
          
          <div className="flex items-center text-sm text-gastro-gray mt-1">
            <span className="mr-2">{customer.partySize} {customer.partySize > 1 ? 'pessoas' : 'pessoa'}</span>
            •
            <span className="mx-2">Tel: {customer.phone}</span>
            •
            <Clock className="h-3 w-3 mx-1" />
            <span className="waiting-time">
              {formatWaitingTime(customer.timestamp)}
            </span>
          </div>
          
          <div className="mt-2">
            {activePreferences.map((pref, index) => (
              <span key={index} className="preference-tag">
                {pref}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
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
