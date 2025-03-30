
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
let currentQueueState = getStoredQueue();
export const subscribers: ((state: WaitingQueueState) => void)[] = [];

// Get the current queue state
export const getCurrentQueue = (): WaitingQueueState => {
  return { ...currentQueueState };
};

// Update the current queue state
export const setCurrentQueue = (queue: WaitingQueueState): void => {
  currentQueueState = { ...queue };
  updateStoredQueue(currentQueueState);
  notifySubscribers();
};

// Notify all subscribers of state changes
export const notifySubscribers = () => {
  subscribers.forEach((callback) => callback({ ...currentQueueState }));
};
