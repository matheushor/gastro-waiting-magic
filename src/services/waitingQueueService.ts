
// Re-export all functionality from the modular files
import { addCustomer, updateCustomerStatus, callCustomer, removeCustomer, updateCustomerInfo } from "./waitingQueue/operations";
import { subscribeToQueueChanges } from "./waitingQueue/subscription";
import { fetchQueueFromDatabase, fetchDailyStatistics } from "./waitingQueue/database";

export {
  addCustomer,
  updateCustomerStatus,
  callCustomer,
  removeCustomer,
  updateCustomerInfo,
  subscribeToQueueChanges,
  fetchQueueFromDatabase,
  fetchDailyStatistics
};
