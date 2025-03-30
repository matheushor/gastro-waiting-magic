
// Re-export all functionality from the modular files
import { addCustomer, updateCustomerStatus, callCustomer, removeCustomer } from "./waitingQueue/operations";
import { subscribeToQueueChanges } from "./waitingQueue/subscription";

export {
  addCustomer,
  updateCustomerStatus,
  callCustomer,
  removeCustomer,
  subscribeToQueueChanges
};
