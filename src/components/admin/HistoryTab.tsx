
import React from "react";
import { DailyStatistics } from "@/types";
import { BarChart, Clock } from "lucide-react";

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
  return (
    <div>
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
              Baseado em atendimentos
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
    </div>
  );
};

export default HistoryTab;
