
import { Customer } from "../../types";
import { supabase } from "../../integrations/supabase/client";
import { getCurrentQueue, setCurrentQueue } from "./storage";

// Add customer to the database
export const addCustomerToDatabase = async (customer: Customer): Promise<Customer> => {
  try {
    // Transform to match database schema
    const supabaseCustomer = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      party_size: customer.partySize,
      preferences: customer.preferences,
      timestamp: customer.timestamp,
      status: customer.status,
      called_at: customer.calledAt,
    };
    
    // Insert the customer into Supabase
    const { data, error } = await supabase
      .from("waiting_customers")
      .insert(supabaseCustomer)
      .select("*")
      .single();
    
    if (error) throw error;
    
    // Increment daily statistics
    const today = new Date().toISOString().split('T')[0];
    
    const statsResult = await supabase.rpc('increment_daily_stats', {
      stats_date: today,
      group_increment: 1,
      people_increment: supabaseCustomer.party_size
    });
    
    if (statsResult.error) throw statsResult.error;
    
    // Return the customer with the database ID
    return {
      ...customer,
      id: data.id,
    };
  } catch (error) {
    console.error("Error adding customer to database:", error);
    throw error;
  }
};

// Remove customer from the database
export const removeCustomerFromDatabase = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("waiting_customers")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error removing customer from database:", error);
    throw error;
  }
};

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
    
    // Transform to our Customer type
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      partySize: data.party_size,
      preferences: data.preferences,
      timestamp: data.timestamp,
      status: data.status as 'waiting' | 'called' | 'seated',
      calledAt: data.called_at ? new Date(data.called_at).getTime() : undefined,
      priority: data.preferences.pregnant || data.preferences.elderly || data.preferences.disabled || data.preferences.infant,
    };
  } catch (error) {
    console.error("Error updating customer in database:", error);
    throw error;
  }
};

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
    
    // Transform to our Customer type
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      partySize: data.party_size,
      preferences: data.preferences,
      timestamp: data.timestamp,
      status: data.status as 'waiting' | 'called' | 'seated',
      calledAt: data.called_at ? new Date(data.called_at).getTime() : undefined,
      priority: data.preferences.pregnant || data.preferences.elderly || data.preferences.disabled || data.preferences.infant,
    };
  } catch (error) {
    console.error("Error updating customer info in database:", error);
    throw error;
  }
};
