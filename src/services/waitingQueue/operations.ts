
import { Customer } from "../../types";
import { supabase } from "../../integrations/supabase/client";
import { getCurrentQueue, setCurrentQueue } from "./storage";

// Add a customer to the waiting queue
export const addCustomer = async (customer: Customer): Promise<void> => {
  try {
    // Try to sync with Supabase first
    const { data, error } = await supabase
      .from("waiting_customers")
      .insert({
        name: customer.name,
        phone: customer.phone,
        party_size: customer.partySize,
        preferences: customer.preferences,
        status: customer.status,
        timestamp: customer.timestamp,
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error adding customer to database:", error);
      throw error;
    }
    
    // If successful, use the returned data with the server-generated ID
    if (data) {
      const newCustomer = {
        ...customer,
        id: data.id, // Use the server-generated UUID
      };
      
      const currentQueue = getCurrentQueue();
      setCurrentQueue({
        ...currentQueue,
        customers: [...currentQueue.customers, newCustomer],
      });
      
      // Increment daily statistics
      await incrementDailyStats(customer.partySize);
    }
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
    
    // Fallback to local storage if Supabase fails
    const currentQueue = getCurrentQueue();
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
    const updateData: any = { status };
    
    if (status === "called") {
      updateData.called_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from("waiting_customers")
      .update(updateData)
      .eq("id", id);
      
    if (error) {
      console.error("Error updating customer status in database:", error);
      throw error;
    }
    
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
  await updateCustomerStatus(id, "called");
};

// Remove a customer from the waiting queue
export const removeCustomer = async (id: string): Promise<void> => {
  const currentQueue = getCurrentQueue();
  
  try {
    // Try to sync with Supabase if available
    const { error } = await supabase
      .from("waiting_customers")
      .delete()
      .eq("id", id);
      
    if (error) {
      console.error("Error removing customer from database:", error);
      throw error;
    }
    
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
    
    if (fetchError) {
      console.error("Error checking for existing daily statistics:", fetchError);
      throw fetchError;
    }
    
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
      
      if (updateError) {
        console.error("Error updating daily statistics:", updateError);
        throw updateError;
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from("daily_statistics")
        .insert({
          date: today,
          groups_count: 1,
          people_count: partySize
        });
      
      if (insertError) {
        console.error("Error inserting daily statistics:", insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Failed to update daily statistics:", error);
  }
};
