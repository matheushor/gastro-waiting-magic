
import React, { useState } from "react";
import { Customer } from "@/types";
import { Clock, AlertCircle, X, Users, User, Shield, Heart, Home, Wind, ShieldAlert } from "lucide-react";
import { formatWaitingTime } from "@/utils/geoUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface WaitingListProps {
  customers: Customer[];
  onLeaveQueue: (id: string) => void;
  userPhoneNumber: string;
}

const WaitingList: React.FC<WaitingListProps> = ({ customers, onLeaveQueue, userPhoneNumber }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [confirmPhone, setConfirmPhone] = useState("");
  const [error, setError] = useState("");

  const calledCustomers = customers.filter(c => c.status === "called");
  const priorityCustomers = customers.filter(c => c.status === "waiting" && c.priority);
  const regularCustomers = customers.filter(c => c.status === "waiting" && !c.priority);
  
  const sortByTimestamp = (a: Customer, b: Customer) => a.timestamp - b.timestamp;
  const sortedPriorityCustomers = [...priorityCustomers].sort(sortByTimestamp);
  const sortedRegularCustomers = [...regularCustomers].sort(sortByTimestamp);
  
  const sortedCustomers = [
    ...calledCustomers,
    ...sortedPriorityCustomers,
    ...sortedRegularCustomers
  ];

  let waitingPosition = 1;
  sortedCustomers.forEach(customer => {
    if (customer.status === "waiting") {
      customer.position = waitingPosition++;
    } else if (customer.status === "called") {
      customer.position = 0;
    } else {
      customer.position = undefined;
    }
  });

  // Encontre o cliente do usuário atual usando o número de telefone
  const userCustomer = sortedCustomers.find(c => c.phone === userPhoneNumber);
  const userPosition = userCustomer?.position;

  const handleLeaveQueueClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setConfirmPhone("");
    setError("");
    setOpenDialog(true);
  };

  const handleConfirmLeaveQueue = () => {
    if (!selectedCustomer) return;
    
    if (confirmPhone !== selectedCustomer.phone) {
      setError("Telefone não confere. Tente novamente.");
      return;
    }
    
    onLeaveQueue(selectedCustomer.id);
    setOpenDialog(false);
  };

  const getPreferenceIcon = (key: string, value: boolean) => {
    if (!value) return null;
    
    switch(key) {
      case 'pregnant':
        return <Heart className="h-3 w-3 text-gastro-orange" />;
      case 'elderly':
        return <User className="h-3 w-3 text-gastro-orange" />;
      case 'disabled':
        return <Heart className="h-3 w-3 text-gastro-orange" />;
      case 'infant':
        return <User className="h-3 w-3 text-gastro-orange" />;
      case 'withDog':
        return <Shield className="h-3 w-3 text-gastro-blue" />;
      case 'indoor':
        return <Home className="h-3 w-3 text-gastro-blue" />;
      case 'outdoor':
        return <Wind className="h-3 w-3 text-gastro-blue" />;
      default:
        return null;
    }
  };

  const renderPreferences = (customer: Customer) => {
    const { preferences } = customer;
    const items = [];
    
    if (preferences.pregnant) items.push({ key: 'pregnant', label: 'Gestante', priority: true });
    if (preferences.elderly) items.push({ key: 'elderly', label: 'Idoso', priority: true });
    if (preferences.disabled) items.push({ key: 'disabled', label: 'PCD', priority: true });
    if (preferences.infant) items.push({ key: 'infant', label: 'Criança de colo', priority: true });
    
    if (preferences.withDog) items.push({ key: 'withDog', label: 'Com cachorro', priority: false });
    if (preferences.indoor) items.push({ key: 'indoor', label: 'Mesa interna', priority: false });
    if (preferences.outdoor) items.push({ key: 'outdoor', label: 'Mesa externa', priority: false });
    
    return (
      <div className="flex flex-wrap gap-1">
        {items.map((item, index) => (
          <Badge 
            key={index} 
            variant="outline" 
            className={`flex items-center gap-1 text-xs ${
              item.priority ? 'border-gastro-orange text-gastro-orange' : 'border-gastro-blue text-gastro-blue'
            }`}
          >
            {getPreferenceIcon(item.key, true)}
            {item.label}
          </Badge>
        ))}
      </div>
    );
  };

  const waitingCount = customers.filter(c => c.status === 'waiting').length;
  const priorityCount = customers.filter(c => c.status === 'waiting' && c.priority).length;

  if (sortedCustomers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gastro-blue to-blue-600 text-white p-6">
          <h2 className="text-xl font-bold flex items-center justify-center gap-2">
            <Users className="h-5 w-5" />
            Fila de Espera
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="py-8">
            <p className="text-gastro-gray mb-2">Não há clientes na fila no momento.</p>
            <p className="text-sm text-gastro-gray">Seja o primeiro a entrar!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-blue-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gastro-blue to-blue-600 text-white p-6">
        <h2 className="text-xl font-bold flex items-center justify-center gap-2">
          <Users className="h-5 w-5" />
          Fila de Espera
        </h2>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-blue-50 rounded-lg mb-4 gap-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gastro-blue" />
            <span className="text-sm font-medium text-gastro-blue">{waitingCount} {waitingCount === 1 ? 'pessoa' : 'pessoas'} na fila</span>
            
            {priorityCount > 0 && (
              <Badge variant="outline" className="bg-gastro-orange/10 border-gastro-orange text-gastro-orange flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                {priorityCount} prioritário{priorityCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          {userPosition !== undefined && (
            <Badge variant="outline" className="bg-blue-100 border-gastro-blue text-gastro-blue flex items-center gap-1 px-3 py-1">
              <User className="h-3 w-3 mr-1" />
              {userPosition === 0 
                ? "Você está sendo chamado!" 
                : `Sua posição: ${userPosition}º`}
            </Badge>
          )}
        </div>
        
        <div className="space-y-3">
          {sortedCustomers.map((customer) => {
            const isUserCustomer = customer.phone === userPhoneNumber;
            
            return (
              <div 
                key={customer.id} 
                className={`border rounded-lg p-4 relative transition-all hover:shadow-md ${
                  isUserCustomer 
                    ? "border-gastro-blue bg-blue-50/50"
                    : customer.status === "called" 
                      ? "border-gastro-orange bg-orange-50" 
                      : customer.priority
                        ? "border-gastro-orange/30 bg-orange-50/20"
                        : "border-gastro-lightGray hover:border-gastro-blue"
                }`}
              >
                {customer.status === "called" && (
                  <div className="absolute -top-2 -right-2 bg-gastro-orange text-white text-xs px-2 py-1 rounded-full animate-pulse-slow font-bold flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    Chamando
                  </div>
                )}
                
                {customer.priority && customer.status === "waiting" && (
                  <div className="absolute -top-2 -right-2 bg-gastro-orange/80 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    Prioritário
                  </div>
                )}
                
                {isUserCustomer && (
                  <div className="absolute -top-2 left-2 bg-gastro-blue text-white text-xs px-3 py-1 rounded-full font-bold">
                    Você
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`font-medium ${isUserCustomer ? "text-gastro-blue" : ""}`}>{customer.name}</h3>
                    <div className="flex items-center text-sm text-gastro-gray gap-2 mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {customer.partySize} {customer.partySize > 1 ? 'pessoas' : 'pessoa'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-gastro-blue">
                          {formatWaitingTime(customer.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {customer.position !== undefined && (
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isUserCustomer
                        ? "bg-gastro-blue text-white"
                        : customer.status === "called" 
                          ? "bg-gastro-orange text-white" 
                          : customer.priority
                            ? "bg-gastro-orange/80 text-white"
                            : "bg-gastro-blue text-white"
                    }`}>
                      {customer.status === "called" ? "0" : customer.position}
                    </div>
                  )}
                </div>
                
                <div className="mb-3">
                  {renderPreferences(customer)}
                </div>
                
                {isUserCustomer && (
                  <button 
                    onClick={() => handleLeaveQueueClick(customer)}
                    className="text-red-500 text-sm flex items-center hover:text-red-700 transition-colors"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Sair da fila
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        {waitingCount > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gastro-gray">
              <strong className="text-gastro-blue">
                Pessoas com necessidades especiais (gestantes, idosos, PCDs e crianças de colo) têm prioridade no atendimento.
              </strong>
            </p>
          </div>
        )}
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar saída da fila</DialogTitle>
            <DialogDescription>
              Para confirmar que é você, digite o número de telefone que você usou para entrar na fila.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="DDD + Número (apenas números)"
              value={confirmPhone}
              onChange={(e) => setConfirmPhone(e.target.value.replace(/\D/g, ""))}
            />
            
            {error && (
              <div className="mt-2 flex items-center text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmLeaveQueue}
              className="bg-red-500 hover:bg-red-600"
            >
              Confirmar Saída
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaitingList;
