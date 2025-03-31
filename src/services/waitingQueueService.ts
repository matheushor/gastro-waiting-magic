
// Re-export all functionality from the modular files
import { addCustomer, updateCustomerStatus, callCustomer, removeCustomer, updateCustomer, calculateAverageWaitTime } from "./waitingQueue/operations";
import { subscribeToQueueChanges } from "./waitingQueue/subscription";
import { fetchQueueFromDatabase, recordDailyStatistics, fetchDailyStatistics } from "./waitingQueue/database";

export {
  addCustomer,
  updateCustomerStatus,
  callCustomer,
  removeCustomer,
  updateCustomer,
  subscribeToQueueChanges,
  fetchQueueFromDatabase,
  recordDailyStatistics,
  fetchDailyStatistics,
  calculateAverageWaitTime
};
