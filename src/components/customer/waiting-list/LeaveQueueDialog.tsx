
import React from "react";
import { AlertCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LeaveQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  confirmPhone: string;
  onConfirmPhoneChange: (value: string) => void;
  error: string;
  onConfirm: () => void;
}

export const LeaveQueueDialog: React.FC<LeaveQueueDialogProps> = ({
  open,
  onOpenChange,
  confirmPhone,
  onConfirmPhoneChange,
  error,
  onConfirm
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar saída da fila</DialogTitle>
          <DialogDescription>
            Para confirmar que é você, digite o número de telefone que você usou para entrar na fila.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Input
            placeholder="DDD + Número (apenas números)"
            value={confirmPhone}
            onChange={(e) => onConfirmPhoneChange(e.target.value.replace(/\D/g, ""))}
          />
          
          {error && (
            <div className="mt-2 flex items-center text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Confirmar Saída
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
