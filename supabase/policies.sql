-- This project uses NextAuth + Prisma for data access.
-- The Supabase anon key is public (client-side), so we enable RLS on application tables to prevent
-- direct PostgREST / Realtime access from unauthenticated clients.
--
-- Intentionally no policies are created for these tables; all reads/writes go through the Next.js server
-- using a privileged DB role (Prisma connection).
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Board" ENABLE ROW LEVEL SECURITY;

-- Private Storage bucket for attachments (served via server-generated signed URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
