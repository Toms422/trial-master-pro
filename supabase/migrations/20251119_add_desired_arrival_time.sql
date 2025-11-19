-- Add desired_arrival_time column to participants table
-- This column stores the participant's preferred arrival time for the trial day

ALTER TABLE public.participants
ADD COLUMN desired_arrival_time TIME;
