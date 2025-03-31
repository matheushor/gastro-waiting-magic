
import React from "react";
import { Customer } from "@/types";
import CustomerCard from "./CustomerCard";
import AdminRegistrationForm from "../AdminRegistrationForm";
import DailyStatistics from "./DailyStatistics";

interface TabContentProps {
  activeTab: 'waiting' | 'called' | 'history' | 'priority' | 'register';
  waitingCustomers: Customer[];
  priorityCustomers: Customer[];
  currentlyServing: Customer | null;
  calledHistory: Customer[];
  onRemoveCustomer: (customer: Customer) => void;
  onFinishServing: (id: string) => void;
  onRegisterCustomer: (customer: Customer) => void;
  queueCounts: {time: string, count: number}[];
  dailyStats: { groups: number, people: number };
}

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  waitingCustomers,
  priorityCustomers,
  currentlyServing,
  calledHistory,
  onRemoveCustomer,
  onFinishServing,
  onRegisterCustomer,
  queueCounts,
  dailyStats
}) => {
  switch (activeTab) {
    case 'waiting':
      return (
        <>
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
                  onRemove={() => onRemoveCustomer(customer)}
                />
              ))}
            </div>
          )}
        </>
      );
      
    case 'called':
      return (
        <>
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
                onRemove={() => onRemoveCustomer(currentlyServing)}
                onFinishServing={() => onFinishServing(currentlyServing.id)}
              />
            </div>
          )}
        </>
      );
      
    case 'priority':
      return (
        <>
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
                  onRemove={() => onRemoveCustomer(customer)}
                  isPriority
                />
              ))}
            </div>
          )}
        </>
      );
      
    case 'history':
      return (
        <>
          <h2 className="text-xl font-bold text-gastro-blue mb-3">Histórico do Dia</h2>
          
          <DailyStatistics dailyStats={dailyStats} queueCounts={queueCounts} />
          
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
        </>
      );
      
    case 'register':
      return (
        <>
          <h2 className="text-xl font-bold text-gastro-blue mb-3">Cadastrar Cliente</h2>
          <AdminRegistrationForm onRegister={onRegisterCustomer} />
        </>
      );
      
    default:
      return null;
  }
};

export default TabContent;
