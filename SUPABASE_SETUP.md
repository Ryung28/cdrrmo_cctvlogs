# CDRRMO CCTV LOGS - Setup Instructions

To sync this application with your Supabase database, create a `.env.local` file in the root directory and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Schema Recommendation
Run the following SQL in your Supabase SQL Editor:

```sql
create table cctv_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  action_type text not null,
  date_of_action date not null,
  classification text not null,
  camera_name text not null,
  incident_datetime timestamp with time zone not null,
  client_name text not null,
  remarks text
);

-- Turn on Row Level Security
alter table cctv_logs enable row level security;

-- Create a policy that allows anyone to insert (Adjust for production)
create policy "Allow public insert" on cctv_logs for insert with check (true);
create policy "Allow public view" on cctv_logs for select using (true);
```
