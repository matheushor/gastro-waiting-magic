
import { WaitingQueueState, Customer } from "../types";
import { initialWaitingQueueState } from "../utils/mockData";
import { supabase } from "../integrations/supabase/client";

// Simulating a database with local storage until we integrate a real backend
const getStoredQueue = (): WaitingQueueState => {
  const storedData = localStorage.getItem("waitingQueue");
  return storedData ? JSON.parse(storedData) : initialWaitingQueueState;
};

const updateStoredQueue = (queue: WaitingQueueState) => {
  localStorage.setItem("waitingQueue", JSON.stringify(queue));
};

// In-memory state for real-time updates
let currentQueue = getStoredQueue();
const subscribers: ((state: WaitingQueueState) => void)[] = [];

// Notify all subscribers of state changes
const notifySubscribers = () => {
  subscribers.forEach((callback) => callback({ ...currentQueue }));
};

// Add a customer to the waiting queue
export const addCustomer = async (customer: Customer): Promise<void> => {
  currentQueue = {
    ...currentQueue,
    customers: [...currentQueue.customers, customer],
  };
  
  updateStoredQueue(currentQueue);
  notifySubscribers();
  
  try {
    // Try to sync with Supabase if available
    const { error } = await supabase
      .from("waiting_customers")
      .insert([{
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        party_size: customer.partySize,
        preferences: customer.preferences as any, // Cast to any to resolve type issue
        status: customer.status,
        timestamp: customer.timestamp,
      }] as any);
      
    if (error) throw error;
    
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
  }
};

// Update a customer's status in the waiting queue
export const updateCustomerStatus = async (id: string, status: "waiting" | "called" | "seated" | "left"): Promise<Customer> => {
  const customerIndex = currentQueue.customers.findIndex((c) => c.id === id);
  
  if (customerIndex === -1) throw new Error("Customer not found");
  
  const updatedCustomers = [...currentQueue.customers];
  updatedCustomers[customerIndex] = {
    ...updatedCustomers[customerIndex],
    status,
  };
  
  const updatedCustomer = updatedCustomers[customerIndex];
  
  currentQueue = {
    ...currentQueue,
    customers: updatedCustomers,
    currentlyServing: status === "called" ? updatedCustomer : currentQueue.currentlyServing,
  };
  
  updateStoredQueue(currentQueue);
  notifySubscribers();
  
  try {
    // Try to sync with Supabase if available
    const { error } = await supabase
      .from("waiting_customers")
      .update({ status })
      .eq("id", id);
      
    if (error) throw error;
    
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
  }
  
  return updatedCustomer;
};

// Call a customer from the waiting queue
export const callCustomer = async (id: string): Promise<void> => {
  const customerIndex = currentQueue.customers.findIndex((c) => c.id === id);
  
  if (customerIndex === -1) return;
  
  const updatedCustomers = [...currentQueue.customers];
  updatedCustomers[customerIndex] = {
    ...updatedCustomers[customerIndex],
    status: "called",
  };
  
  currentQueue = {
    ...currentQueue,
    customers: updatedCustomers,
    currentlyServing: updatedCustomers[customerIndex],
  };
  
  updateStoredQueue(currentQueue);
  notifySubscribers();
  
  try {
    // Try to sync with Supabase if available
    const { error } = await supabase
      .from("waiting_customers")
      .update({ status: "called" })
      .eq("id", id);
      
    if (error) throw error;
    
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
  }
};

// Remove a customer from the waiting queue
export const removeCustomer = async (id: string): Promise<void> => {
  currentQueue = {
    ...currentQueue,
    customers: currentQueue.customers.filter((c) => c.id !== id),
    currentlyServing: currentQueue.currentlyServing?.id === id ? null : currentQueue.currentlyServing,
  };
  
  updateStoredQueue(currentQueue);
  notifySubscribers();
  
  try {
    // Try to sync with Supabase if available
    const { error } = await supabase
      .from("waiting_customers")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    
  } catch (error) {
    console.warn("Failed to sync with database, using local storage instead", error);
  }
};

// Subscribe to queue changes
export const subscribeToQueueChanges = (
  callback: (state: WaitingQueueState) => void
) => {
  subscribers.push(callback);
  callback({ ...currentQueue });
  
  try {
    // Try to subscribe to Supabase real-time changes
    const channel = supabase
      .channel('public:waiting_customers')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'waiting_customers' }, (payload) => {
        // Refetch all data when a change occurs
        fetchQueueFromDatabase();
      })
      .subscribe();
      
    // Initial fetch
    fetchQueueFromDatabase();
    
    // Return unsubscribe function
    return () => {
      const index = subscribers.indexOf(callback);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.warn("Failed to subscribe to database changes, using local updates only", error);
    
    // Return unsubscribe function for local updates only
    return () => {
      const index = subscribers.indexOf(callback);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };
  }
};

// Fetch the latest queue data from the database
const fetchQueueFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from("waiting_customers")
      .select("*");
      
    if (error) throw error;
    
    if (data) {
      // Transform the data to match our WaitingQueueState structure
      const customers: Customer[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        partySize: item.party_size,
        preferences: item.preferences,
        timestamp: item.timestamp,
        status: item.status,
        priority: item.preferences.pregnant || item.preferences.elderly || item.preferences.disabled || item.preferences.infant,
      }));
      
      currentQueue = {
        ...currentQueue,
        customers,
      };
      
      updateStoredQueue(currentQueue);
      notifySubscribers();
    }
  } catch (error) {
    console.warn("Failed to fetch from database, using local storage instead", error);
  }
};
