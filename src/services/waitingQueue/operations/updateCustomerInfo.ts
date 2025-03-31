
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";
import type { Json } from "@/integrations/supabase/types";

/**
 * Update customer information in the waiting queue
 * @param id Customer ID to update
 * @param customerInfo Updated customer information
 * @returns Promise<Customer> Updated customer object
 */
export async function updateCustomerInfo(
  id: string,
  customerInfo: Partial<Customer>
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

  // Prepare the data to update
  const updateData: Record<string, any> = {};

  if (customerInfo.name) updateData.name = customerInfo.name;
  if (customerInfo.phone) updateData.phone = customerInfo.phone;
  if (customerInfo.partySize) updateData.party_size = customerInfo.partySize;
  if (customerInfo.preferences) updateData.preferences = customerInfo.preferences as unknown as Json;
  if (customerInfo.status) updateData.status = customerInfo.status;
  if (customerInfo.timestamp) updateData.timestamp = customerInfo.timestamp;
  if (customerInfo.calledAt !== undefined) {
    updateData.called_at = typeof customerInfo.calledAt === "number"
      ? new Date(customerInfo.calledAt).toISOString()
      : customerInfo.calledAt;
  }

  // Update the database
  const { data, error } = await supabase
    .from("waiting_customers")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer:", error);
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
