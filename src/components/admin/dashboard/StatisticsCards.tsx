
import React from "react";
import { Users, Clock, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types";

interface StatisticsCardsProps {
  waitingCount: number;
  avgWaitTime: number | null;
  onCallNext: () => void;
  currentlyServing: Customer | null;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  waitingCount,
  avgWaitTime,
  onCallNext,
  currentlyServing,
}) => {
  return (
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
  );
};

export default StatisticsCards;
