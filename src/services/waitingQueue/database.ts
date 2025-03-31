
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
        calledAt: item.called_at ? new Date(item.called_at).getTime() : undefined,
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

// Fetch daily statistics from the database
export const fetchDailyStatistics = async (limit = 7): Promise<{ date: string, groups_count: number, people_count: number }[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_daily_statistics', { limit_param: limit }) as { 
        data: { date: string, groups_count: number, people_count: number }[] | null, 
        error: Error | null 
      };
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.warn("Failed to fetch daily statistics", error);
    return [];
  }
};
