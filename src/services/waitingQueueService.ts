
import { WaitingQueueState, Customer } from "@/types";
import {
  fetchQueueFromDatabase,
  recordDailyStatistics,
  fetchDailyStatistics
} from "./waitingQueue/database";
import {
  getCurrentQueue,
  setCurrentQueue
} from "./waitingQueue/storage";
import {
  subscribeToQueueChanges
} from "./waitingQueue/subscription";
import {
  addCustomer as addCustomerToQueue,
  removeCustomer as removeCustomerFromQueue,
  updateCustomer as updateCustomerInQueue,
  updateCustomerStatus,
  callCustomer as callCustomerFromQueue,
  calculateAverageWaitTime
} from "./waitingQueue/operations";

export {
  getCurrentQueue,
  setCurrentQueue,
  subscribeToQueueChanges,
  calculateAverageWaitTime,
  fetchQueueFromDatabase,
  fetchDailyStatistics,
  updateCustomerStatus
};

// Add a customer to the waiting queue
export const addCustomer = async (customer: Customer): Promise<void> => {
  if (!customer) {
    throw new Error("Customer data is required");
  }
  
  // Ensure customer has an ID
  if (!customer.id) {
    customer.id = crypto.randomUUID();
  }
  
  try {
    await addCustomerToQueue(customer);
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
};

// Remove a customer from the waiting queue
export const removeCustomer = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error("Customer ID is required");
  }
  
  try {
    await removeCustomerFromQueue(id);
  } catch (error) {
    console.error("Error removing customer:", error);
    throw error;
  }
};

// Call a customer from the waiting queue
export const callCustomer = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error("Customer ID is required");
  }
  
  try {
    await callCustomerFromQueue(id);
  } catch (error) {
    console.error("Error calling customer:", error);
    throw error;
  }
};

// Update customer information in the waiting queue
export const updateCustomer = async (customer: Customer): Promise<void> => {
  if (!customer || !customer.id) {
    throw new Error("Valid customer data with ID is required");
  }
  
  try {
    await updateCustomerInQueue(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};
