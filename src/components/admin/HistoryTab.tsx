
import React from "react";
import { DailyStatistics } from "@/types";
import { BarChart, Clock, Calendar } from "lucide-react";

interface HistoryTabProps {
  dailyStats: DailyStatistics[];
  queueCounts: {time: string, count: number}[];
  realAvgWaitTime: number | null;
  isMobile: boolean;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ 
  dailyStats,
  queueCounts,
  realAvgWaitTime,
  isMobile
}) => {
  // Get today's statistics from the first item (most recent)
  const todayStats = dailyStats.length > 0 ? dailyStats[0] : null;
  const todayDate = new Date().toLocaleDateString('pt-BR');

  return (
    <div>
      <h2 className="text-xl font-bold text-gastro-blue mb-3">Histórico do Dia</h2>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h3 className="font-semibold text-gastro-blue mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Estatísticas de Hoje ({todayDate})
        </h3>
        <div className={`grid gap-4 mb-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h4 className="text-sm font-medium text-gastro-blue mb-1">Clientes Hoje</h4>
            <p className="text-2xl font-bold text-gastro-blue">
              {todayStats?.groups_count || 0} <span className="text-sm font-normal text-gastro-gray">grupos</span>
            </p>
            <p className="text-sm text-gastro-gray">
              ({todayStats?.people_count || 0} pessoas no total)
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
            <h4 className="text-sm font-medium text-gastro-orange mb-1">Tempo Médio de Espera</h4>
            <p className="text-2xl font-bold text-gastro-orange">
              {realAvgWaitTime ? `${realAvgWaitTime}m` : "-"}
            </p>
            <p className="text-sm text-gastro-gray">
              Baseado em atendimentos reais
            </p>
          </div>
        </div>
        
        <h3 className="font-semibold text-gastro-blue mb-3 flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Variação da Fila Hoje
        </h3>
        
        <div className="relative h-40">
          {queueCounts.length > 0 ? (
            <div className="absolute inset-0 flex items-end justify-between">
              {queueCounts.map((item, index) => {
                const height = item.count > 0 ? (item.count / Math.max(...queueCounts.map(i => i.count)) * 100) : 0;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-gastro-blue rounded-t"
                      style={{ height: `${height}%`, minHeight: item.count > 0 ? '10%' : '0' }}
                    ></div>
                    <div className="text-xs text-gastro-gray mt-1 w-10 text-center overflow-hidden text-ellipsis">
                      {item.time}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gastro-gray">Sem dados para exibir</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-gastro-blue mb-3">Últimos 7 Dias</h3>
        <div className="space-y-4">
          {dailyStats.slice(0, 7).map((stat, index) => (
            <div key={index} className="flex justify-between items-center p-2 border-b">
              <div className="text-gastro-gray">
                {new Date(stat.date).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center">
                <span className="text-gastro-blue font-semibold">{stat.groups_count} grupos</span>
                <span className="text-gastro-gray text-sm ml-2">({stat.people_count} pessoas)</span>
              </div>
            </div>
          ))}
          
          {dailyStats.length === 0 && (
            <div className="text-center p-4">
              <p className="text-gastro-gray">Sem histórico disponível</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;
