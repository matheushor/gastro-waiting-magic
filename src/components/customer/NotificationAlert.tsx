
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types";
import { CheckCircle, Clock } from "lucide-react";

interface NotificationAlertProps {
  customer: Customer;
  onConfirm: () => void;
  onTimeExpired: () => void;
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({
  customer,
  onConfirm,
  onTimeExpired,
}) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeExpired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const circumference = 2 * Math.PI * 45; // r = 45
  const dashOffset = circumference * (1 - timeLeft / 300);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 animate-scale-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gastro-blue mb-2">É a sua vez!</h2>
          <p className="text-gastro-gray">
            Olá, {customer.name}! Sua mesa para {customer.partySize}{" "}
            {customer.partySize > 1 ? "pessoas" : "pessoa"} está pronta.
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
              />
              {/* Progress circle */}
              <circle
                className="text-gastro-orange"
                strokeWidth="8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: dashOffset,
                  transition: "stroke-dashoffset 1s ease",
                }}
              />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
              <Clock className="w-6 h-6 text-gastro-blue mb-1" />
              <span className="text-2xl font-bold text-gastro-blue">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gastro-gray">
            Por favor, dirija-se ao balcão nos próximos{" "}
            <span className="font-bold">{minutes} minutos e {seconds.toString().padStart(2, "0")} segundos</span> para ser
            acomodado. Após esse período, você voltará para a fila.
          </p>
        </div>

        <Button
          onClick={onConfirm}
          className="w-full btn-accent flex items-center justify-center gap-2"
        >
          <CheckCircle className="h-5 w-5" />
          <span>Confirmar Presença</span>
        </Button>
      </div>
    </div>
  );
};

export default NotificationAlert;
