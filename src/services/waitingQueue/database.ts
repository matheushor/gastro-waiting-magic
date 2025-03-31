
import { supabase } from "../../integrations/supabase/client";
import { Customer, DailyStatistics } from "../../types";
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
    
    // Check if we already have a record for today
    const { data: existingData, error: fetchError } = await supabase
      .from("daily_statistics")
      .select("*")
      .eq("date", today)
      .maybeSingle();
    
    if (fetchError) {
      console.warn("Failed to fetch daily statistics", fetchError);
      return;
    }
    
    if (existingData) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("daily_statistics")
        .update({
          groups_count: existingData.groups_count + 1,
          people_count: existingData.people_count + partySize
        })
        .eq("date", today);
        
      if (updateError) {
        console.warn("Failed to update daily statistics", updateError);
      }
    } else {
      // Create new record for today
      const { error: insertError } = await supabase
        .from("daily_statistics")
        .insert({
          date: today,
          groups_count: 1,
          people_count: partySize
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
    // Get the last 30 days of statistics
    const { data, error } = await supabase
      .from("daily_statistics")
      .select("*")
      .order("date", { ascending: false })
      .limit(30);
      
    if (error) {
      console.warn("Failed to fetch daily statistics", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn("Failed to fetch daily statistics", error);
    return [];
  }
};
