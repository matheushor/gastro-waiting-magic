
import { Customer } from "../../types";
import { supabase } from "../../integrations/supabase/client";
import { getCurrentQueue, setCurrentQueue } from "./storage";
import { recordDailyStatistics } from "./database";
import { Json } from "@/integrations/supabase/types";

// Helper function to convert Customer preferences to Json
const convertPreferencesToJson = (preferences: any): Json => {
  return preferences as unknown as Json;
};

// Add a customer to the waiting queue
export const addCustomer = async (customer: Customer): Promise<void> => {
  // Convert Preferences to JSON-compatible format
  const supabaseCustomer = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    party_size: customer.partySize,
    preferences: convertPreferencesToJson(customer.preferences),
    status: customer.status,
    timestamp: customer.timestamp,
  };
  
  const currentQueue = getCurrentQueue();
  
  setCurrentQueue({
    ...currentQueue,
    customers: [...currentQueue.customers, customer],
  });
  
  try {
    // Try to sync with Supabase if available
    const { error } = await supabase
      .from("waiting_customers")
      .insert(supabaseCustomer);
      
    if (error) throw error;
    
    // Record daily statistics when a customer is added
    await recordDailyStatistics(customer.partySize);
    
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
  }
};

// Update a customer's status in the waiting queue
export const updateCustomerStatus = async (id: string, status: "waiting" | "called" | "seated" | "left"): Promise<Customer> => {
  const currentQueue = getCurrentQueue();
  const customerIndex = currentQueue.customers.findIndex((c) => c.id === id);
  
  if (customerIndex === -1) throw new Error("Customer not found");
  
  const updatedCustomers = [...currentQueue.customers];
  updatedCustomers[customerIndex] = {
    ...updatedCustomers[customerIndex],
    status,
  };
  
  const updatedCustomer = updatedCustomers[customerIndex];
  
  // If the customer is being called, record the call time for wait time calculations
  if (status === "called") {
    updatedCustomer.calledAt = Date.now();
  }
  
  setCurrentQueue({
    ...currentQueue,
    customers: updatedCustomers,
    currentlyServing: status === "called" ? updatedCustomer : currentQueue.currentlyServing,
  });
  
  try {
    // Try to sync with Supabase if available
    const { error } = await supabase
      .from("waiting_customers")
      .update({ 
        status,
        ...(status === "called" ? { called_at: new Date().toISOString() } : {})
      })
      .eq("id", id);
      
    if (error) throw error;
    
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
  }
  
  return updatedCustomer;
};

// Call a customer from the waiting queue
export const callCustomer = async (id: string): Promise<void> => {
  const currentQueue = getCurrentQueue();
  const customerIndex = currentQueue.customers.findIndex((c) => c.id === id);
  
  if (customerIndex === -1) return;
  
  const updatedCustomers = [...currentQueue.customers];
  updatedCustomers[customerIndex] = {
    ...updatedCustomers[customerIndex],
    status: "called",
    calledAt: Date.now() // Add call time for wait time calculations
  };
  
  setCurrentQueue({
    ...currentQueue,
    customers: updatedCustomers,
    currentlyServing: updatedCustomers[customerIndex],
  });
  
  try {
    // Try to sync with Supabase if available
    const { error } = await supabase
      .from("waiting_customers")
      .update({ 
        status: "called",
        called_at: new Date().toISOString()
      })
      .eq("id", id);
      
    if (error) throw error;
    
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
  }
};

// Remove a customer from the waiting queue
export const removeCustomer = async (id: string): Promise<void> => {
  const currentQueue = getCurrentQueue();
  
  setCurrentQueue({
    ...currentQueue,
    customers: currentQueue.customers.filter((c) => c.id !== id),
    currentlyServing: currentQueue.currentlyServing?.id === id ? null : currentQueue.currentlyServing,
  });
  
  try {
    // Try to sync with Supabase if available
    const { error } = await supabase
      .from("waiting_customers")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
  }
};

// Update customer information
export const updateCustomer = async (customer: Customer): Promise<void> => {
  const currentQueue = getCurrentQueue();
  const customerIndex = currentQueue.customers.findIndex((c) => c.id === customer.id);
  
  if (customerIndex === -1) throw new Error("Customer not found");
  
  const updatedCustomers = [...currentQueue.customers];
  updatedCustomers[customerIndex] = customer;
  
  setCurrentQueue({
    ...currentQueue,
    customers: updatedCustomers,
    currentlyServing: currentQueue.currentlyServing?.id === customer.id ? customer : currentQueue.currentlyServing,
  });
  
  try {
    // Try to sync with Supabase if available
    const { error } = await supabase
      .from("waiting_customers")
      .update({
        name: customer.name,
        phone: customer.phone,
        party_size: customer.partySize,
        preferences: convertPreferencesToJson(customer.preferences),
      })
      .eq("id", customer.id);
      
    if (error) throw error;
    
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
  }
};

// Calculate average waiting time based on historical data
export const calculateAverageWaitTime = (customers: Customer[]): number | null => {
  // Encontrar apenas clientes que foram chamados e têm um timestamp de chamada (calledAt)
  const completedWaits = customers.filter(c => c.status === "called" && c.calledAt);
  
  if (completedWaits.length === 0) return null;
  
  // Calcular o tempo de espera para cada cliente (tempo de chamada - tempo de entrada)
  const waitTimes = completedWaits.map(c => (c.calledAt || 0) - c.timestamp);
  const totalWaitTime = waitTimes.reduce((sum, time) => sum + time, 0);
  
  // Retornar o tempo médio de espera em minutos
  return Math.ceil(totalWaitTime / waitTimes.length / 60000);
};
