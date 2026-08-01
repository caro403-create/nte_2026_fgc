-- Create alerts table for system notifications and Telegram Bot integration
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'danger')),
    source TEXT NOT NULL,
    message TEXT NOT NULL,
    location TEXT,
    telegram_message_id TEXT,
    telegram_chat_id TEXT,
    processed BOOLEAN DEFAULT false,
    reporter_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to alerts (for dashboard display)
CREATE POLICY "Alerts are viewable by everyone" 
    ON public.alerts
    FOR SELECT USING (true);

-- Allow authenticated users to insert alerts (e.g. brigadistas reporting from the app)
CREATE POLICY "Authenticated users can insert alerts" 
    ON public.alerts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Service role bypasses RLS by default, so the Telegram Bot (using service_role key) 
-- will be able to INSERT and UPDATE (e.g., to mark 'processed' as true) without issues.

-- Create an index to quickly filter unprocessed alerts for the bot
CREATE INDEX idx_alerts_processed ON public.alerts(processed);
-- Create an index to quickly order alerts by time for the dashboard
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at DESC);
