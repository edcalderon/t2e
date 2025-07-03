-- Add admin_id column to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON public.notifications(admin_id);

-- Add a comment to document the change
COMMENT ON COLUMN public.notifications.admin_id IS 'References the admin user who is the recipient of this notification';

-- Update any existing notifications to have a default admin_id if needed
-- Uncomment and modify the following line if you want to set a default admin_id for existing records
-- UPDATE public.notifications SET admin_id = 'YOUR_DEFAULT_ADMIN_UUID_HERE' WHERE admin_id IS NULL;
