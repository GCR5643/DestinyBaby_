INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "reports_read_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'reports');

CREATE POLICY "reports_insert_authenticated" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'reports' AND auth.role() = 'authenticated');
