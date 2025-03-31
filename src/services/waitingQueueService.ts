
// Re-export all functionality from the modular files
import { 
  addCustomer, 
  updateCustomerStatus, 
  removeCustomer, 
  updateCustomerInfo 
} from "./waitingQueue/operations";
import { subscribeToQueueChanges } from "./waitingQueue/subscription";
import { fetchQueueFromDatabase, fetchDailyStatistics } from "./waitingQueue/database";

export {
  addCustomer,
  updateCustomerStatus,
  removeCustomer,
  updateCustomerInfo,
  subscribeToQueueChanges,
  fetchQueueFromDatabase,
  fetchDailyStatistics
};
