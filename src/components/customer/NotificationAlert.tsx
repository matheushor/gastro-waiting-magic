
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types";
import { CheckCircle, Clock, MapPin } from "lucide-react";

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
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos em segundos

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
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gastro-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="h-10 w-10 text-gastro-orange" />
          </div>
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
          <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-start">
            <MapPin className="h-5 w-5 text-gastro-blue mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-gastro-gray text-left">
              Dirija-se ao restaurante na <strong className="text-gastro-blue">Av. Independência, 3848 - Jardim Sumaré, Ribeirão Preto</strong> e confirme sua presença no balcão.
            </p>
          </div>
          <p className="text-sm text-gastro-gray">
            Por favor, confirme sua presença nos próximos{" "}
            <span className="font-bold">{minutes} minutos e {seconds.toString().padStart(2, "0")} segundos</span>. Após esse período, você será removido da fila.
          </p>
        </div>

        <Button
          onClick={onConfirm}
          className="w-full bg-gastro-orange hover:bg-orange-600 text-white flex items-center justify-center gap-2 py-6"
        >
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Confirmar Presença</span>
        </Button>
      </div>
    </div>
  );
};

export default NotificationAlert;
