
import { supabase } from "@/integrations/supabase/client";
import { Customer, Preferences } from "@/types";
import type { Json } from "@/integrations/supabase/types";

/**
 * Add a new customer to the waiting queue
 * @param customer Customer object
 * @returns Promise<void>
 */
export async function addCustomer(customer: Customer): Promise<void> {
  if (!customer?.id) return;

  // Convert timestamp to number if it's not already
  const timestamp = typeof customer.timestamp === "string"
    ? parseInt(customer.timestamp)
    : customer.timestamp;

  // Convert calledAt to ISO string if it's a number
  const called_at = typeof customer.calledAt === "number"
    ? new Date(customer.calledAt).toISOString()
    : customer.calledAt;

  const { error } = await supabase.from("waiting_customers").insert({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    party_size: customer.partySize,
    preferences: customer.preferences as unknown as Json,
    timestamp,
    status: customer.status,
    called_at,
  });

  if (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
}
