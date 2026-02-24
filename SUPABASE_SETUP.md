# CDRRMO CCTV LOGS - Setup Instructions

To sync this application with your Supabase database, create a `.env.local` file in the root directory and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Connection
The application is now connected to the correct Supabase project (`tggpzgdefublovkdfvpi.supabase.co`) where the `cctv_logs` table resides.

### Database Schema (Run this in Supabase SQL Editor)
Run the following SQL to create the table with ALL required fields:

```sql
-- Create the cctv_logs table
CREATE TABLE public.cctv_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  action_type text NOT NULL,
  date_of_action date NOT NULL,
  classification text NOT NULL DEFAULT '',
  camera_name text NOT NULL DEFAULT '',
  incident_datetime text NOT NULL DEFAULT '',
  client_name text NOT NULL DEFAULT '',
  remarks text DEFAULT '',
  classification_remarks text DEFAULT '',
  offline_cameras text DEFAULT '[]'
);

-- Enable Row Level Security
ALTER TABLE public.cctv_logs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (adjust for production)
CREATE POLICY "Allow public insert" ON public.cctv_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public view" ON public.cctv_logs FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON public.cctv_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.cctv_logs FOR DELETE USING (true);

-- IMPORTANT: Refresh the schema cache after creating the table
NOTIFY pgrst, 'reload schema';
```

### How to run the SQL:
1. Go to your Supabase Dashboard (https://supabase.com)
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Copy and paste the SQL above
5. Click **Run** to execute

### After creating the table:
- Refresh your Next.js app at http://localhost:3000
- The logs should now save successfully!
