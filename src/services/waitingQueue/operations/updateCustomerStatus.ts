
import { Customer } from "../../../types";
import { supabase } from "../../../integrations/supabase/client";
import { getCurrentQueue, setCurrentQueue } from "../storage";
import { Json } from "../../../integrations/supabase/types";

// Update a customer's status in the database
export const updateCustomerStatusInDatabase = async (
  id: string,
  status: 'waiting' | 'called' | 'seated'
): Promise<Customer> => {
  try {
    // Current timestamp for when a customer is called
    const calledAt = status === 'called' ? new Date().toISOString() : null;
    
    // Update the customer in Supabase
    const { data, error } = await supabase
      .from("waiting_customers")
      .update({
        status,
        called_at: calledAt,
      })
      .eq("id", id)
      .select("*")
      .single();
    
    if (error) throw error;
    
    // Update our local state
    const queue = getCurrentQueue();
    const updatedCustomer: Customer = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      partySize: data.party_size,
      preferences: data.preferences as unknown as Customer['preferences'],
      timestamp: data.timestamp,
      status: data.status as 'waiting' | 'called' | 'seated' | 'left',
      calledAt: data.called_at ? new Date(data.called_at).getTime() : undefined,
      priority: (data.preferences as any)?.pregnant || (data.preferences as any)?.elderly || 
               (data.preferences as any)?.disabled || (data.preferences as any)?.infant,
    };
    
    setCurrentQueue({
      ...queue,
      customers: queue.customers.map(c => c.id === id ? updatedCustomer : c),
      currentlyServing: status === 'called' ? updatedCustomer : queue.currentlyServing,
    });
    
    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer status in database:", error);
    throw error;
  }
};
