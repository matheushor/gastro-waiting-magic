
import { Customer } from "../../../types";
import { supabase } from "../../../integrations/supabase/client";
import { getCurrentQueue, setCurrentQueue } from "../storage";

// Update customer status in the database
export const updateCustomerStatusInDatabase = async (id: string, status: 'waiting' | 'called' | 'seated'): Promise<Customer> => {
  try {
    const updates: any = {
      status,
    };
    
    // If status is 'called', update the called_at timestamp
    if (status === 'called') {
      updates.called_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from("waiting_customers")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();
    
    if (error) throw error;
    
    // Update our local state
    const queue = getCurrentQueue();
    const updatedCustomers = queue.customers.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          calledAt: status === 'called' ? new Date().getTime() : c.calledAt,
        };
      }
      return c;
    });
    
    setCurrentQueue({
      ...queue,
      customers: updatedCustomers,
    });
    
    // Transform to our Customer type with proper type casting for preferences
    const customerPreferences = data.preferences as unknown as Customer['preferences'];
    
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      partySize: data.party_size,
      preferences: customerPreferences,
      timestamp: data.timestamp,
      status: data.status as 'waiting' | 'called' | 'seated',
      calledAt: data.called_at ? new Date(data.called_at).getTime() : undefined,
      priority: customerPreferences.pregnant || customerPreferences.elderly || 
               customerPreferences.disabled || customerPreferences.infant,
    };
  } catch (error) {
    console.error("Error updating customer in database:", error);
    throw error;
  }
};
