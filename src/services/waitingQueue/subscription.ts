
import { supabase } from "../../integrations/supabase/client";
import { WaitingQueueState } from "../../types";
import { getCurrentQueue, subscribers } from "./storage";
import { fetchQueueFromDatabase } from "./database";

// Subscribe to queue changes
export const subscribeToQueueChanges = (
  callback: (state: WaitingQueueState) => void
) => {
  subscribers.push(callback);
  callback({ ...getCurrentQueue() });
  
  // Use a fallback approach that doesn't depend on WebSockets
  let supbaseSubscriptionActive = false;
  
  try {
    // Safer way to check if we can use Supabase
    if (supabase && typeof supabase.channel === 'function') {
      try {
        const channel = supabase
          .channel('public:waiting_customers')
          .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'waiting_customers' }, (payload) => {
            fetchQueueFromDatabase();
          })
          .subscribe((status: any) => {
            if (status === 'SUBSCRIBED') {
              supbaseSubscriptionActive = true;
              fetchQueueFromDatabase(); // Initial fetch when subscription is successful
            } else {
              console.warn("Supabase subscription status:", status);
            }
          });
          
        // Return unsubscribe function that handles both Supabase and local
        return () => {
          const index = subscribers.indexOf(callback);
          if (index !== -1) {
            subscribers.splice(index, 1);
          }
          
          if (supbaseSubscriptionActive) {
            supabase.removeChannel(channel);
          }
        };
      } catch (wsError) {
        console.warn("WebSocket connection failed, falling back to local updates", wsError);
      }
    }
  } catch (error) {
    console.warn("Failed to set up Supabase connection, using local updates only", error);
  }
  
  // If we reach here, we're using local updates only
  // Set up a polling mechanism as a fallback
  const pollingInterval = setInterval(() => {
    callback({ ...getCurrentQueue() });
  }, 5000);
  
  // Return unsubscribe function for local updates
  return () => {
    const index = subscribers.indexOf(callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
    clearInterval(pollingInterval);
  };
};
