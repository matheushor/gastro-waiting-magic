
import { Customer } from "../../../types";
import { supabase } from "../../../integrations/supabase/client";
import { getCurrentQueue, setCurrentQueue } from "../storage";

// Update customer information in the database
export const updateCustomerInfoInDatabase = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
  try {
    // Transform to match database schema
    const dbUpdates: any = {};
    
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.partySize) dbUpdates.party_size = updates.partySize;
    if (updates.preferences) dbUpdates.preferences = updates.preferences;
    
    const { data, error } = await supabase
      .from("waiting_customers")
      .update(dbUpdates)
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
          ...updates,
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
    console.error("Error updating customer info in database:", error);
    throw error;
  }
};
