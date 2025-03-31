
import { supabase } from "../../../integrations/supabase/client";

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
