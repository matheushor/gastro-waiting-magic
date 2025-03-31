
import React from "react";

export const PriorityNotice: React.FC = () => {
  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <p className="text-sm text-gastro-gray">
        <strong className="text-gastro-blue">
          Pessoas com necessidades especiais (gestantes, idosos, PCDs e crianças de colo) têm prioridade no atendimento.
        </strong>
      </p>
    </div>
  );
};
