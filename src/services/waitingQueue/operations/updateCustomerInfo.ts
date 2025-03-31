
import { Customer } from "../../../types";
import { supabase } from "../../../integrations/supabase/client";
import { getCurrentQueue, setCurrentQueue } from "../storage";
import { Json } from "../../../integrations/supabase/types";

// Update a customer's information in the database
export const updateCustomerInfoInDatabase = async (
  id: string,
  updates: Partial<Customer>
): Promise<Customer> => {
  try {
    // Transform to match database schema
    const supabaseUpdates: Record<string, any> = {};
    
    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
    if (updates.partySize !== undefined) supabaseUpdates.party_size = updates.partySize;
    if (updates.preferences !== undefined) supabaseUpdates.preferences = updates.preferences as unknown as Json;
    if (updates.status !== undefined) supabaseUpdates.status = updates.status;
    
    // Update the customer in Supabase
    const { data, error } = await supabase
      .from("waiting_customers")
      .update(supabaseUpdates)
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
      currentlyServing: queue.currentlyServing?.id === id ? updatedCustomer : queue.currentlyServing,
    });
    
    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer info in database:", error);
    throw error;
  }
};
