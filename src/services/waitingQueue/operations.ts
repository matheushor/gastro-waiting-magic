
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
  
  try {
    // Try to sync with Supabase first
    const { data, error } = await supabase
      .from("waiting_customers")
      .insert({
        name: supabaseCustomer.name,
        phone: supabaseCustomer.phone,
        party_size: supabaseCustomer.party_size,
        preferences: supabaseCustomer.preferences,
        status: supabaseCustomer.status,
        timestamp: supabaseCustomer.timestamp,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // If successful, use the returned data with the server-generated ID
    if (data) {
      const newCustomer = {
        ...customer,
        id: data.id, // Use the server-generated UUID
      };
      
      setCurrentQueue({
        ...currentQueue,
        customers: [...currentQueue.customers, newCustomer],
      });
      
      // Increment daily statistics
      await incrementDailyStats(customer.partySize);
      
      return;
    }
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
    
    // Fallback to local storage if Supabase fails
    setCurrentQueue({
      ...currentQueue,
      customers: [...currentQueue.customers, customer],
    });
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
  
  try {
    // Try to sync with Supabase if available
    const { error } = await supabase
      .from("waiting_customers")
      .update({ 
        status,
        called_at: status === "called" ? new Date().toISOString() : null,
      })
      .eq("id", id);
      
    if (error) throw error;
    
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
  }
  
  setCurrentQueue({
    ...currentQueue,
    customers: updatedCustomers,
    currentlyServing: status === "called" ? updatedCustomer : currentQueue.currentlyServing,
  });
  
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
  };
  
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
  
  setCurrentQueue({
    ...currentQueue,
    customers: updatedCustomers,
    currentlyServing: updatedCustomers[customerIndex],
  });
};

// Remove a customer from the waiting queue
export const removeCustomer = async (id: string): Promise<void> => {
  const currentQueue = getCurrentQueue();
  const customer = currentQueue.customers.find(c => c.id === id);
  
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
  
  setCurrentQueue({
    ...currentQueue,
    customers: currentQueue.customers.filter((c) => c.id !== id),
    currentlyServing: currentQueue.currentlyServing?.id === id ? null : currentQueue.currentlyServing,
  });
};

// Helper function to increment daily statistics
const incrementDailyStats = async (partySize: number): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if a record exists for today
    const { data: existingData, error: fetchError } = await supabase
      .from("daily_statistics")
      .select("*")
      .eq("date", today)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    
    if (existingData) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("daily_statistics")
        .update({
          groups_count: existingData.groups_count + 1,
          people_count: existingData.people_count + partySize,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingData.id);
      
      if (updateError) throw updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from("daily_statistics")
        .insert({
          date: today,
          groups_count: 1,
          people_count: partySize
        });
      
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error("Failed to update daily statistics:", error);
  }
};
