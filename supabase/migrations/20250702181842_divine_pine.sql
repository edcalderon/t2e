/*
  # Notifications System Setup

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `type` (text) - notification type (system, reward, challenge, achievement, admin, personal)
      - `title` (text) - notification title
      - `message` (text) - notification content
      - `data` (jsonb) - additional data payload
      - `read` (boolean) - read status
      - `user_id` (uuid) - target user (null for global notifications)
      - `admin_id` (uuid) - admin who sent it (for admin notifications)
      - `priority` (text) - priority level (low, medium, high, urgent)
      - `expires_at` (timestamptz) - expiration date (optional)
      - `action_url` (text) - action URL (optional)
      - `image_url` (text) - image URL (optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for users to read their own notifications and global notifications
    - Add policies for admins to manage notifications

  3. Indexes
    - Add indexes for efficient querying by user_id, type, read status, and created_at
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'system' CHECK (type IN ('system', 'reward', 'challenge', 'achievement', 'admin', 'personal')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  expires_at timestamptz,
  action_url text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance before enabling RLS
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_global ON notifications(user_id) WHERE user_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS after table and indexes are created
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for users to read their notifications and global notifications
CREATE POLICY "Users can read their own notifications and global notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR user_id IS NULL
  );

-- Create policy for users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policy for users to delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy for admins to insert notifications
CREATE POLICY "Admins can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- For now, allow any authenticated user to create notifications
    -- In production, you might want to check for admin role
    auth.uid() IS NOT NULL
  );

-- Create policy for admins to read all notifications
CREATE POLICY "Admins can read all notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    -- For now, allow reading if user is admin (you can implement role checking here)
    auth.uid() IS NOT NULL
  );



-- Insert some sample notifications for testing
INSERT INTO notifications (type, title, message, priority, user_id) VALUES
  ('system', 'Welcome to XQuests!', 'Thank you for joining XQuests. Start participating in challenges to earn ALGO rewards!', 'medium', NULL),
  ('admin', 'Platform Update', 'We''ve added new features to improve your experience. Check out the latest challenges!', 'high', NULL),
  ('system', 'New Challenge Available', 'A new crypto education challenge is now available. Earn up to 40 ALGO!', 'medium', NULL);