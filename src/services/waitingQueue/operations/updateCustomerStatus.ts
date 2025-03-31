
import { supabase } from "@/integrations/supabase/client";
import { Customer, Preferences } from "@/types";
import type { Json } from "@/integrations/supabase/types";

/**
 * Update a customer status
 * @param id Customer ID
 * @param status New status
 * @returns Promise<Customer | null>
 */
export async function updateCustomerStatus(
  id: string,
  status: "waiting" | "called" | "seated" | "left"
): Promise<Customer | null> {
  const now = new Date();
  const timestamp = now.getTime();

  // Update the customer in the database
  const { data, error } = await supabase
    .from("customers")
    .update({
      status,
      called_at: status === "called" ? now.toISOString() : null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating customer status:", error);
    throw error;
  }

  if (!data) return null;

  // Convert the data to a Customer object
  const customer: Customer = {
    id: data.id,
    name: data.name,
    phone: data.phone,
    partySize: data.party_size,
    preferences: data.preferences as unknown as Preferences,
    timestamp: data.timestamp,
    status: data.status as "waiting" | "called" | "seated" | "left",
    called_at: data.called_at ? new Date(data.called_at).getTime() : null,
    priority:
      (data.preferences as unknown as Preferences).pregnant ||
      (data.preferences as unknown as Preferences).elderly ||
      (data.preferences as unknown as Preferences).disabled ||
      (data.preferences as unknown as Preferences).infant,
  };

  return customer;
}
