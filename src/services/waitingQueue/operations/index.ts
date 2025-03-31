
import { Customer } from "../../../types";
import { v4 as uuidv4 } from "uuid";
import { getCurrentQueue, setCurrentQueue } from "../storage";
import { addCustomerToDatabase } from "./addCustomer";
import { removeCustomerFromDatabase } from "./removeCustomer";
import { updateCustomerStatusInDatabase } from "./updateCustomerStatus";
import { updateCustomerInfoInDatabase } from "./updateCustomerInfo";

// Add a customer to the queue
export const addCustomer = async (customer: Customer): Promise<Customer> => {
  try {
    // Generate a UUID if not provided
    const customerWithId = {
      ...customer,
      id: customer.id || uuidv4(),
    };
    
    // Add to the database
    const addedCustomer = await addCustomerToDatabase(customerWithId);
    
    // Update our local state
    const queue = getCurrentQueue();
    setCurrentQueue({
      ...queue,
      customers: [...queue.customers, addedCustomer],
    });
    
    return addedCustomer;
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
};

// Remove a customer from the queue
export const removeCustomer = async (id: string): Promise<void> => {
  try {
    // Remove from the database
    await removeCustomerFromDatabase(id);
    
    // Update our local state
    const queue = getCurrentQueue();
    setCurrentQueue({
      ...queue,
      customers: queue.customers.filter(c => c.id !== id),
      currentlyServing: queue.currentlyServing?.id === id ? null : queue.currentlyServing,
    });
  } catch (error) {
    console.error("Error removing customer:", error);
    throw error;
  }
};

// Update a customer's status
export const updateCustomerStatus = async (id: string, status: 'waiting' | 'called' | 'seated'): Promise<Customer> => {
  try {
    // Update in the database
    const updatedCustomer = await updateCustomerStatusInDatabase(id, status);
    
    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer status:", error);
    throw error;
  }
};

// Call a customer (special case of updating status)
export const callCustomer = async (id: string): Promise<Customer> => {
  return updateCustomerStatus(id, 'called');
};

// Update customer info
export const updateCustomerInfo = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
  try {
    // Update in the database
    const updatedCustomer = await updateCustomerInfoInDatabase(id, updates);
    
    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer info:", error);
    throw error;
  }
};

// Re-export all the database operations for use in other files
export {
  addCustomerToDatabase,
  removeCustomerFromDatabase,
  updateCustomerStatusInDatabase,
  updateCustomerInfoInDatabase
};
