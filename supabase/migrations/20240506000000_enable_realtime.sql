
-- Enable full replica identity for the waiting_customers table to get complete row data in updates
ALTER TABLE public.waiting_customers REPLICA IDENTITY FULL;

-- Add the waiting_customers table to the supabase_realtime publication to enable real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.waiting_customers;

-- Add the daily_statistics table to the supabase_realtime publication
ALTER TABLE public.daily_statistics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_statistics;
