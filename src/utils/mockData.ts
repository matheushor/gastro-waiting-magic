import { Customer, WaitingQueueState } from "../types";

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Create mock customers
export const createMockCustomers = (): Customer[] => {
  return [
    {
      id: generateId(),
      name: "Maria Silva",
      phone: "11987654321",
      partySize: 4,
      preferences: {
        pregnant: true,
        elderly: false,
        disabled: false,
        infant: true,
        withDog: false,
        indoor: true,
        outdoor: false
      },
      timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
      status: "waiting"
    },
    {
      id: generateId(),
      name: "João Santos",
      phone: "11912345678",
      partySize: 2,
      preferences: {
        pregnant: false,
        elderly: true,
        disabled: false,
        infant: false,
        withDog: false,
        indoor: false,
        outdoor: true
      },
      timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      status: "waiting"
    },
    {
      id: generateId(),
      name: "Ana Pereira",
      phone: "11998765432",
      partySize: 6,
      preferences: {
        pregnant: false,
        elderly: false,
        disabled: false,
        infant: false,
        withDog: true,
        indoor: false,
        outdoor: true
      },
      timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
      status: "waiting"
    }
  ];
};

// Create initial waiting queue state
export const initialWaitingQueueState: WaitingQueueState = {
  customers: createMockCustomers(),
  currentlyServing: null
};

// Mock admin credentials
export const mockAdminCredentials = {
  username: "admin",
  password: "gastro2024"
};
