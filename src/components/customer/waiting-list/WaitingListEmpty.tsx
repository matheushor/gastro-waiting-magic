
import React from "react";
import { Users } from "lucide-react";

export const WaitingListEmpty: React.FC = () => {
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
};
