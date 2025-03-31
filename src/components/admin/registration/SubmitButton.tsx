
import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isLoading: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading }) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-gastro-orange hover:bg-orange-600 text-white font-bold py-2" 
      disabled={isLoading}
    >
      {isLoading ? "Processando..." : "Adicionar Cliente"}
    </Button>
  );
};

export default SubmitButton;
