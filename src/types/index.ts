
export interface Customer {
  id: string;
  name: string;
  phone: string;
  partySize: number;
  preferences: Preferences;
  timestamp: number; // Unix timestamp when customer joined the queue
  status: 'waiting' | 'called' | 'seated' | 'left';
  position?: number; // Position in the queue
  priority?: boolean; // Indicates if the customer has priority (pregnant, elderly, disabled, infant)
}

export interface Preferences {
  pregnant: boolean;
  elderly: boolean;
  disabled: boolean;
  infant: boolean;
  withDog: boolean;
  indoor: boolean;
  outdoor: boolean; // Added for external tables
}

export interface Admin {
  username: string;
  password: string;
}

export interface WaitingQueueState {
  customers: Customer[];
  currentlyServing: Customer | null;
}
