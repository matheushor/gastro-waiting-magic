
import { supabase } from "../../integrations/supabase/client";
import { WaitingQueueState } from "../../types";
import { getCurrentQueue, subscribers } from "./storage";
import { fetchQueueFromDatabase } from "./database";

// Subscribe to queue changes
export const subscribeToQueueChanges = (
  callback: (state: WaitingQueueState) => void
): (() => void) => {
  subscribers.push(callback);
  callback({ ...getCurrentQueue() });
  
  // Set up real-time subscription using Supabase
  let supabaseSubscriptionActive = false;
  
  try {
    // First, fetch initial data
    fetchQueueFromDatabase().then(() => {
      callback({ ...getCurrentQueue() });
    });
    
    // Set up real-time channel
    const channel = supabase
      .channel('public:waiting_customers')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'waiting_customers' }, 
        async (payload) => {
          console.log("Received real-time update:", payload);
          await fetchQueueFromDatabase();
          callback({ ...getCurrentQueue() });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          supabaseSubscriptionActive = true;
          console.log("Supabase real-time subscription active");
        } else {
          console.warn("Supabase subscription status:", status);
        }
      });
      
    // Set up subscription for daily statistics as well
    const statsChannel = supabase
      .channel('public:daily_statistics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'daily_statistics' }, 
        (payload) => {
          console.log("Daily statistics updated:", payload);
        }
      )
      .subscribe();
      
    // Return unsubscribe function that handles both Supabase and local
    return () => {
      const index = subscribers.indexOf(callback);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
      
      if (supabaseSubscriptionActive) {
        channel.unsubscribe();
        statsChannel.unsubscribe();
      }
    };
  } catch (error) {
    console.error("Failed to set up Supabase connection:", error);
    
    // If we reach here, we're using local updates only
    // Set up a polling mechanism as a fallback
    const pollingInterval = setInterval(() => {
      fetchQueueFromDatabase().then(() => {
        callback({ ...getCurrentQueue() });
      });
    }, 5000);
    
    // Return unsubscribe function for local updates
    return () => {
      const index = subscribers.indexOf(callback);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
      clearInterval(pollingInterval);
    };
  }
};
