
import { WaitingQueueState } from "../../types";
import { initialWaitingQueueState } from "../../utils/mockData";

// Simulating a database with local storage until we integrate a real backend
export const getStoredQueue = (): WaitingQueueState => {
  const storedData = localStorage.getItem("waitingQueue");
  return storedData ? JSON.parse(storedData) : initialWaitingQueueState;
};

export const updateStoredQueue = (queue: WaitingQueueState) => {
  localStorage.setItem("waitingQueue", JSON.stringify(queue));
};

// In-memory state for real-time updates
export let currentQueue = getStoredQueue();
export const subscribers: ((state: WaitingQueueState) => void)[] = [];

// Notify all subscribers of state changes
export const notifySubscribers = () => {
  subscribers.forEach((callback) => callback({ ...currentQueue }));
};
