
import React from "react";
import { Users, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WaitingListHeaderProps {
  waitingCount?: number;
  priorityCount?: number;
}

export const WaitingListHeader: React.FC<WaitingListHeaderProps> = ({ 
  waitingCount, 
  priorityCount 
}) => {
  if (waitingCount === undefined) {
    // This is the main header
    return (
      <div className="bg-gradient-to-r from-gastro-blue to-blue-600 text-white p-6">
        <h2 className="text-xl font-bold flex items-center justify-center gap-2">
          <Users className="h-5 w-5" />
          Fila de Espera
        </h2>
      </div>
    );
  }

  // This is the stats header
  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-gastro-blue" />
      <span className="text-sm font-medium text-gastro-blue">
        {waitingCount} {waitingCount === 1 ? 'pessoa' : 'pessoas'} na fila
      </span>
      
      {priorityCount && priorityCount > 0 && (
        <Badge variant="outline" className="bg-gastro-orange/10 border-gastro-orange text-gastro-orange flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" />
          {priorityCount} prioritário{priorityCount > 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
};
