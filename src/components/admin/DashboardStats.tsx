
import React from "react";
import { Button } from "@/components/ui/button";
import { Users, Clock, BellRing, LogOut } from "lucide-react";

interface DashboardStatsProps {
  waitingCount: number;
  avgWaitTime: number | null;
  onCallNext: () => void;
  onLogout: () => void;
  currentlyServing: boolean;
  isMobile: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  waitingCount,
  avgWaitTime,
  onCallNext,
  onLogout,
  currentlyServing,
  isMobile
}) => {
  return (
    <div>
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
              {avgWaitTime ? `${avgWaitTime}m` : "-"}
            </h2>
            <p className="text-sm text-gastro-gray">Tempo médio de espera</p>
          </div>
        </div>
        
        <div>
          <Button 
            onClick={onCallNext} 
            disabled={waitingCount === 0 || currentlyServing}
            className="h-full w-full bg-gastro-orange hover:bg-orange-600 text-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center"
          >
            <BellRing className="h-10 w-10 mb-2" />
            <span className="text-lg font-semibold">Chamar Próximo</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
