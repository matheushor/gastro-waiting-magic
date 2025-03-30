
import { supabase } from "@/integrations/supabase/client";
import { Customer, WaitingQueueState } from "@/types";
import { Json } from "@/integrations/supabase/types";

// Converte um Customer para o formato do banco de dados
export const customerToDbFormat = (customer: Customer) => {
  return {
    name: customer.name,
    phone: customer.phone,
    party_size: customer.partySize,
    preferences: customer.preferences as unknown as Json, // Fixed type casting
    timestamp: customer.timestamp,
    status: customer.status,
    priority: customer.priority || false, // Add priority field
  };
};

// Converte um registro do banco de dados para o formato Customer
export const dbToCustomerFormat = (record: any): Customer => {
  return {
    id: record.id,
    name: record.name,
    phone: record.phone,
    partySize: record.party_size,
    preferences: record.preferences as any, // Use any to avoid deep type issues
    timestamp: record.timestamp,
    status: record.status as 'waiting' | 'called' | 'seated' | 'left',
    priority: record.priority || false, // Add priority field
  };
};

// Busca todos os clientes na fila
export const fetchAllCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('waiting_customers')
    .select('*')
    .order('timestamp', { ascending: true });

  if (error) {
    console.error("Erro ao buscar clientes:", error);
    throw error;
  }

  return data.map(dbToCustomerFormat);
};

// Adiciona um novo cliente à fila
export const addCustomer = async (customer: Customer): Promise<Customer> => {
  const { data, error } = await supabase
    .from('waiting_customers')
    .insert(customerToDbFormat(customer))
    .select()
    .single();

  if (error) {
    console.error("Erro ao adicionar cliente:", error);
    throw error;
  }

  return dbToCustomerFormat(data);
};

// Remove um cliente da fila
export const removeCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('waiting_customers')
    .delete()
    .match({ id });

  if (error) {
    console.error("Erro ao remover cliente:", error);
    throw error;
  }
};

// Atualiza o status de um cliente
export const updateCustomerStatus = async (
  id: string, 
  status: 'waiting' | 'called' | 'seated' | 'left'
): Promise<Customer> => {
  const { data, error } = await supabase
    .from('waiting_customers')
    .update({ status })
    .match({ id })
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar status do cliente:", error);
    throw error;
  }

  return dbToCustomerFormat(data);
};

// Fetch priority customers only
export const fetchPriorityCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('waiting_customers')
    .select('*')
    .eq('priority', true)
    .eq('status', 'waiting')
    .order('timestamp', { ascending: true });

  if (error) {
    console.error("Erro ao buscar clientes prioritários:", error);
    throw error;
  }

  return data.map(dbToCustomerFormat);
};

// Configura uma assinatura em tempo real para atualizações na fila
export const subscribeToQueueChanges = (callback: (state: WaitingQueueState) => void) => {
  // Busca inicial dos dados
  fetchAllCustomers().then(customers => {
    const currentlyServing = customers.find(c => c.status === 'called') || null;
    callback({ customers, currentlyServing });
  }).catch(error => {
    console.error("Erro na busca inicial:", error);
  });

  // Configura o canal de tempo real
  const channel = supabase
    .channel('public:waiting_customers')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'waiting_customers'
    }, async () => {
      // A cada mudança, busca todos os dados novamente
      try {
        const customers = await fetchAllCustomers();
        const currentlyServing = customers.find(c => c.status === 'called') || null;
        callback({ customers, currentlyServing });
      } catch (error) {
        console.error("Erro ao atualizar após mudança:", error);
      }
    })
    .subscribe();

  // Retorna uma função para cancelar a assinatura
  return () => {
    supabase.removeChannel(channel);
  };
};
