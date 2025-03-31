
import { supabase } from "../../../integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Remove a customer from the waiting queue
 * @param id Customer ID to remove
 * @returns Promise<void>
 */
export async function removeCustomer(id: string): Promise<void> {
  if (!id) return;

  try {
    const { error } = await supabase
      .from("waiting_customers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error removing customer:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to remove customer:", error);
    throw error;
  }
}
