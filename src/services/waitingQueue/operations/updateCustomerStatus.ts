
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";
import type { Json } from "@/integrations/supabase/types";

/**
 * Update a customer's status in the waiting queue
 * @param id Customer ID to update
 * @param status New status ('waiting', 'called', 'seated', 'left')
 * @returns Promise<Customer> Updated customer object
 */
export async function updateCustomerStatus(
  id: string,
  status: "waiting" | "called" | "seated" | "left"
): Promise<Customer> {
  // Get the current data first
  const { data: currentData, error: fetchError } = await supabase
    .from("waiting_customers")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Error fetching customer data:", fetchError);
    throw fetchError;
  }

  // Determine calledAt based on the new status
  let calledAt = currentData.called_at;
  if (status === "called" && (!calledAt || currentData.status !== "called")) {
    calledAt = new Date().toISOString();
  }

  // Update the database
  const { data, error } = await supabase
    .from("waiting_customers")
    .update({
      status: status,
      called_at: calledAt
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer status:", error);
    throw error;
  }

  const preferences = data.preferences as unknown as Customer['preferences'];

  // Transform the data back to match our Customer type
  const updatedCustomer: Customer = {
    id: data.id,
    name: data.name,
    phone: data.phone,
    partySize: data.party_size,
    preferences: preferences,
    timestamp: data.timestamp,
    status: data.status as 'waiting' | 'called' | 'seated' | 'left',
    calledAt: data.called_at ? new Date(data.called_at).getTime() : undefined,
    priority: preferences.pregnant || preferences.elderly || 
              preferences.disabled || preferences.infant,
  };

  return updatedCustomer;
}
