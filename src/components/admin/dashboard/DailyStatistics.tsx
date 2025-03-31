
import React from "react";
import { Calendar, Group, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DailyStatisticsProps {
  dailyStats: { groups: number, people: number };
  queueCounts: { time: string, count: number }[];
}

const DailyStatistics: React.FC<DailyStatisticsProps> = ({
  dailyStats,
  queueCounts,
}) => {
  return (
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
  );
};

export default DailyStatistics;
