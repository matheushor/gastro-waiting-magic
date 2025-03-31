
import React from "react";
import { User } from "lucide-react";

const FormHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-gastro-blue to-blue-600 text-white p-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <User className="h-5 w-5" />
        Adicionar Cliente
      </h2>
    </div>
  );
};

export default FormHeader;
