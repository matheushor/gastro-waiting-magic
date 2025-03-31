
import { supabase } from "../../integrations/supabase/client";
import { Customer } from "../../types";
import { getCurrentQueue, setCurrentQueue } from "./storage";

// Fetch the latest queue data from the database
export const fetchQueueFromDatabase = async (): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("waiting_customers")
      .select("*");
      
    if (error) throw error;
    
    if (data) {
      // Transform the data to match our WaitingQueueState structure
      const customers: Customer[] = data.map((item: any) => ({
        id: item.id, // Keep database UUID
        name: item.name,
        phone: item.phone,
        partySize: item.party_size,
        preferences: item.preferences,
        timestamp: item.timestamp,
        status: item.status,
        priority: item.preferences.pregnant || item.preferences.elderly || item.preferences.disabled || item.preferences.infant,
      }));
      
      const currentQueue = getCurrentQueue();
      setCurrentQueue({
        ...currentQueue,
        customers,
      });
    }
  } catch (error) {
    console.warn("Failed to fetch from database, using local storage instead", error);
  }
};

// Record daily statistics for the number of groups added
export const recordDailyStatistics = async (partySize: number): Promise<void> => {
  try {
    // Get today's date in format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have a record for today
    const { data, error } = await supabase
      .from("daily_statistics")
      .select("*")
      .eq("date", today)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error;
    }
    
    if (data) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("daily_statistics")
        .update({
          groups_count: data.groups_count + 1,
          people_count: data.people_count + partySize
        })
        .eq("date", today);
        
      if (updateError) throw updateError;
    } else {
      // Create new record for today
      const { error: insertError } = await supabase
        .from("daily_statistics")
        .insert({
          date: today,
          groups_count: 1,
          people_count: partySize
        });
        
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.warn("Failed to record daily statistics", error);
  }
};

// Fetch daily statistics for reporting
export const fetchDailyStatistics = async (): Promise<{ date: string; groups_count: number; people_count: number }[]> => {
  try {
    // Get the last 30 days of statistics
    const { data, error } = await supabase
      .from("daily_statistics")
      .select("*")
      .order("date", { ascending: false })
      .limit(30);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.warn("Failed to fetch daily statistics", error);
    return [];
  }
};
