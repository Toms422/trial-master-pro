-- Add RLS policies to allow anonymous users to access participants by QR code
-- This enables public check-in form access while maintaining security

-- Allow anonymous users to view participants by QR code (for check-in form)
CREATE POLICY "Anonymous users can view participants by QR code"
  ON public.participants FOR SELECT
  TO anon
  USING (qr_code IS NOT NULL);

-- Allow anonymous users to update participants by QR code (for form submission)
CREATE POLICY "Anonymous users can update participants by QR code"
  ON public.participants FOR UPDATE
  TO anon
  USING (qr_code IS NOT NULL)
  WITH CHECK (qr_code IS NOT NULL);

-- Allow anonymous users to view trial days (needed for check-in context)
CREATE POLICY "Anonymous users can view trial days by participant"
  ON public.trial_days FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to view stations (for check-in form context)
CREATE POLICY "Anonymous users can view stations by participant"
  ON public.stations FOR SELECT
  TO anon
  USING (true);
