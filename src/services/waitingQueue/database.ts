
import { supabase } from "../../integrations/supabase/client";
import { Customer } from "../../types";
import { getCurrentQueue, setCurrentQueue } from "./storage";

// Fetch the latest queue data from the database
export const fetchQueueFromDatabase = async (): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("waiting_customers")
      .select("*")
      .order("timestamp", { ascending: true });
      
    if (error) {
      console.error("Error fetching queue:", error);
      throw error;
    }
    
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
        currentlyServing: customers.find(c => c.status === "called") || null
      });
    }
  } catch (error) {
    console.warn("Failed to fetch from database, using local storage instead", error);
  }
};

// Fetch daily statistics from the database
export const fetchDailyStatistics = async (): Promise<{ groups: number, people: number }> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from("daily_statistics")
      .select("groups_count, people_count")
      .eq("date", today)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching daily statistics:", error);
      throw error;
    }
    
    if (data) {
      return {
        groups: data.groups_count,
        people: data.people_count
      };
    }
    
    // Return default values if no data found
    return { groups: 0, people: 0 };
  } catch (error) {
    console.warn("Failed to fetch daily statistics", error);
    return { groups: 0, people: 0 };
  }
};
