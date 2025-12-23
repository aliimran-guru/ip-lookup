-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Scheduled scans table
CREATE TABLE public.scheduled_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  target TEXT NOT NULL,
  scan_type TEXT NOT NULL DEFAULT 'network',
  cron_expression TEXT NOT NULL DEFAULT '0 * * * *',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scan results table  
CREATE TABLE public.scan_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_scan_id UUID REFERENCES public.scheduled_scans(id) ON DELETE CASCADE,
  target TEXT NOT NULL,
  scan_type TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_hosts INTEGER NOT NULL DEFAULT 0,
  active_hosts INTEGER NOT NULL DEFAULT 0,
  scan_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IP status changes for notifications
CREATE TABLE public.ip_status_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_scan_id UUID REFERENCES public.scheduled_scans(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_notified BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.scheduled_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_status_changes ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required for this tool)
CREATE POLICY "Allow public read scheduled_scans" ON public.scheduled_scans FOR SELECT USING (true);
CREATE POLICY "Allow public insert scheduled_scans" ON public.scheduled_scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update scheduled_scans" ON public.scheduled_scans FOR UPDATE USING (true);
CREATE POLICY "Allow public delete scheduled_scans" ON public.scheduled_scans FOR DELETE USING (true);

CREATE POLICY "Allow public read scan_results" ON public.scan_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert scan_results" ON public.scan_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read ip_status_changes" ON public.ip_status_changes FOR SELECT USING (true);
CREATE POLICY "Allow public insert ip_status_changes" ON public.ip_status_changes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update ip_status_changes" ON public.ip_status_changes FOR UPDATE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_scheduled_scans_updated_at
  BEFORE UPDATE ON public.scheduled_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for status changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.ip_status_changes;

-- Indexes
CREATE INDEX idx_scan_results_scheduled_scan ON public.scan_results(scheduled_scan_id);
CREATE INDEX idx_scan_results_created_at ON public.scan_results(created_at DESC);
CREATE INDEX idx_ip_status_changes_scan ON public.ip_status_changes(scheduled_scan_id);
CREATE INDEX idx_ip_status_changes_detected ON public.ip_status_changes(detected_at DESC);