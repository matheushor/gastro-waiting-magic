
import { Customer } from "../../types";
import { supabase } from "../../integrations/supabase/client";
import { getCurrentQueue, setCurrentQueue } from "./storage";

// Add a customer to the waiting queue
export const addCustomer = async (customer: Customer): Promise<void> => {
  // Create a proper UUID format for database
  const supabaseCustomer = {
    ...customer,
    // Use Supabase's UUID generation on the server side
    party_size: customer.partySize,
    preferences: customer.preferences as any, // Required type assertion for Supabase
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
      .insert({
        name: supabaseCustomer.name,
        phone: supabaseCustomer.phone,
        party_size: supabaseCustomer.party_size,
        preferences: supabaseCustomer.preferences,
        status: supabaseCustomer.status,
        timestamp: supabaseCustomer.timestamp,
      });
      
    if (error) throw error;
    
    // Increment daily statistics
    const today = new Date().toISOString().split('T')[0];
    
    // Corrigindo o problema: usando o tipo correto para funções RPC
    const { error: statsError } = await supabase.rpc('increment_daily_stats', {
      stats_date: today,
      group_increment: 1,
      people_increment: supabaseCustomer.party_size
    }) as unknown as { error: Error | null };
    
    if (statsError) throw statsError;
    
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
  }
};

// Update a customer's info in the waiting queue
export const updateCustomerInfo = async (id: string, updatedCustomer: Partial<Customer>): Promise<Customer> => {
  const currentQueue = getCurrentQueue();
  const customerIndex = currentQueue.customers.findIndex((c) => c.id === id);
  
  if (customerIndex === -1) throw new Error("Customer not found");
  
  const updatedCustomers = [...currentQueue.customers];
  updatedCustomers[customerIndex] = {
    ...updatedCustomers[customerIndex],
    ...updatedCustomer,
  };
  
  const resultCustomer = updatedCustomers[customerIndex];
  
  setCurrentQueue({
    ...currentQueue,
    customers: updatedCustomers,
    currentlyServing: currentQueue.currentlyServing?.id === id ? resultCustomer : currentQueue.currentlyServing,
  });
  
  try {
    // Try to sync with Supabase if available
    const updateData: any = {};
    
    if (updatedCustomer.name) updateData.name = updatedCustomer.name;
    if (updatedCustomer.phone) updateData.phone = updatedCustomer.phone;
    if (updatedCustomer.partySize) updateData.party_size = updatedCustomer.partySize;
    if (updatedCustomer.preferences) updateData.preferences = updatedCustomer.preferences;
    if (updatedCustomer.status) updateData.status = updatedCustomer.status;
    
    const { error } = await supabase
      .from("waiting_customers")
      .update(updateData)
      .eq("id", id);
      
    if (error) throw error;
    
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
  }
  
  return resultCustomer;
};

// Update a customer's status in the waiting queue
export const updateCustomerStatus = async (id: string, status: "waiting" | "called" | "seated" | "left"): Promise<Customer> => {
  const currentQueue = getCurrentQueue();
  const customerIndex = currentQueue.customers.findIndex((c) => c.id === id);
  
  if (customerIndex === -1) throw new Error("Customer not found");
  
  const updatedCustomers = [...currentQueue.customers];
  
  // If status is changing to "called", add called_at timestamp
  if (status === "called" && updatedCustomers[customerIndex].status !== "called") {
    updatedCustomers[customerIndex] = {
      ...updatedCustomers[customerIndex],
      status,
      calledAt: Date.now(), // Add timestamp when customer is called
    };
  } else {
    updatedCustomers[customerIndex] = {
      ...updatedCustomers[customerIndex],
      status,
    };
  }
  
  const updatedCustomer = updatedCustomers[customerIndex];
  
  setCurrentQueue({
    ...currentQueue,
    customers: updatedCustomers,
    currentlyServing: status === "called" ? updatedCustomer : currentQueue.currentlyServing,
  });
  
  try {
    // Try to sync with Supabase if available
    const updateData: any = { status };
    
    // If status is changing to "called", add called_at timestamp
    if (status === "called") {
      updateData.called_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from("waiting_customers")
      .update(updateData)
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
    calledAt: Date.now(), // Add timestamp when customer is called
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
