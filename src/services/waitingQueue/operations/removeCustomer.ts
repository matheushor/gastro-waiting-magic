
import { supabase } from "../../../integrations/supabase/client";

/**
 * Remove a customer from the waiting queue
 * @param id Customer ID to remove
 * @returns Promise<void>
 */
export async function removeCustomer(id: string): Promise<void> {
  if (!id) return;

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error removing customer:", error);
    throw error;
  }
}
