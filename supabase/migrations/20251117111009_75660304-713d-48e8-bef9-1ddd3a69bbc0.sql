-- Enable realtime for participants table
ALTER TABLE public.participants REPLICA IDENTITY FULL;

-- The participants table should already be part of supabase_realtime publication
-- This is just to ensure it's included
DO $$ 
BEGIN
  -- Check if table is already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
  END IF;
END $$;