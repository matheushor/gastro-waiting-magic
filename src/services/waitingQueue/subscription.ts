
import { WaitingQueueState } from "../../types";
import { supabase } from "../../integrations/supabase/client"; 
import { getCurrentQueue, setCurrentQueue, subscribers } from "./storage";
import { fetchQueueFromDatabase } from "./database";

// Subscribe to queue changes and get notifications when the queue is updated
export const subscribeToQueueChanges = (
  callback: (state: WaitingQueueState) => void
): (() => void) => {
  // Add the callback to the list of subscribers
  subscribers.push(callback);
  
  // Send the initial state
  const currentQueue = getCurrentQueue();
  callback({ ...currentQueue });
  
  // Set up subscription to Supabase real-time changes if available
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'waiting_customers'
      },
      (payload) => {
        console.log('Real-time update received:', payload);
        // Refresh the queue from the database
        fetchQueueFromDatabase().then(() => {
          // State will be updated by fetchQueueFromDatabase
          // and it will automatically trigger notifications to subscribers
        });
      }
    )
    .subscribe();

  // Return function to unsubscribe
  return () => {
    const index = subscribers.indexOf(callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
    
    // Unsubscribe from Supabase real-time updates if channel exists
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
};
