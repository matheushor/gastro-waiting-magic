
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
      toast({
        title: "Error",
        description: "Failed to remove customer from queue",
        variant: "destructive",
      });
      throw error;
    }
    
    toast({
      title: "Success",
      description: "Customer removed from queue",
    });
  } catch (error) {
    console.error("Failed to remove customer:", error);
    toast({
      title: "Error",
      description: "Failed to remove customer from queue",
      variant: "destructive",
    });
    throw error;
  }
}
