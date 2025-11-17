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
CREATE POLICY "Anonymous users can view trial days"
  ON public.trial_days FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to view stations (for check-in form context)
CREATE POLICY "Anonymous users can view stations"
  ON public.stations FOR SELECT
  TO anon
  USING (true);