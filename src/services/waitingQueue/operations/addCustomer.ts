
import { Customer } from "../../../types";
import { supabase } from "../../../integrations/supabase/client";
import { getCurrentQueue, setCurrentQueue } from "../storage";
import { Json } from "../../../integrations/supabase/types";

// Add customer to the database
export const addCustomerToDatabase = async (customer: Customer): Promise<Customer> => {
  try {
    // Transform to match database schema
    const supabaseCustomer = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      party_size: customer.partySize,
      preferences: customer.preferences as unknown as Json,
      timestamp: customer.timestamp,
      status: customer.status,
      called_at: customer.calledAt ? new Date(customer.calledAt).toISOString() : null, // Convert to ISO string
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
    
    const statsResult = await supabase.rpc(
      'increment_daily_stats',
      {
        stats_date: today,
        group_increment: 1,
        people_increment: supabaseCustomer.party_size
      }
    );
    
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
