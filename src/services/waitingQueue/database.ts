
import { supabase } from "../../integrations/supabase/client";
import { Customer, DailyStatistics } from "../../types";
import { getCurrentQueue, setCurrentQueue } from "./storage";
import { Json } from "@/integrations/supabase/types";

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
        calledAt: item.called_at ? new Date(item.called_at).getTime() : undefined
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
    
    // Using a more flexible approach to avoid type errors
    // First check if we have a record for today
    const { data: existingStats, error: fetchError } = await supabase
      .rpc('get_daily_statistics_by_date', { date_param: today });
    
    if (fetchError) {
      console.warn("Failed to fetch daily statistics", fetchError);
      return;
    }
    
    if (existingStats && existingStats.length > 0) {
      // Update existing record using RPC function
      const { error: updateError } = await supabase
        .rpc('update_daily_statistics', { 
          date_param: today, 
          groups_count_increment: 1, 
          people_count_increment: partySize 
        });
        
      if (updateError) {
        console.warn("Failed to update daily statistics", updateError);
      }
    } else {
      // Insert new record using RPC function
      const { error: insertError } = await supabase
        .rpc('insert_daily_statistics', {
          date_param: today,
          groups_count_value: 1,
          people_count_value: partySize
        });
        
      if (insertError) {
        console.warn("Failed to record daily statistics", insertError);
      }
    }
  } catch (error) {
    console.warn("Failed to record daily statistics", error);
  }
};

// Fetch daily statistics for reporting
export const fetchDailyStatistics = async (): Promise<DailyStatistics[]> => {
  try {
    // Use RPC to get the last 30 days of statistics
    const { data, error } = await supabase
      .rpc('get_daily_statistics', { limit_param: 30 });
      
    if (error) {
      console.warn("Failed to fetch daily statistics", error);
      return [];
    }
    
    // Convert the raw data to our DailyStatistics type
    return (data || []).map((item: any) => ({
      date: item.date,
      groups_count: item.groups_count,
      people_count: item.people_count
    }));
  } catch (error) {
    console.warn("Failed to fetch daily statistics", error);
    return [];
  }
};
