
-- Create daily statistics table
CREATE TABLE IF NOT EXISTS public.daily_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  groups_count INTEGER NOT NULL DEFAULT 0,
  people_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add called_at column to waiting_customers if it doesn't exist
ALTER TABLE public.waiting_customers
ADD COLUMN IF NOT EXISTS called_at TIMESTAMP WITH TIME ZONE;
