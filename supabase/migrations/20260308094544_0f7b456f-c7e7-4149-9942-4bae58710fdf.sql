-- Coaching messages table for coach-athlete communication
CREATE TABLE public.coaching_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text NOT NULL,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  content text NOT NULL,
  attachment_url text,
  attachment_type text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_coaching_messages_conversation ON public.coaching_messages(conversation_id, created_at DESC);
CREATE INDEX idx_coaching_messages_recipient ON public.coaching_messages(recipient_id, is_read);

ALTER TABLE public.coaching_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON public.coaching_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.coaching_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update read status"
  ON public.coaching_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.coaching_messages;

-- Session recordings table
CREATE TABLE public.session_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  coach_user_id uuid NOT NULL,
  athlete_user_id uuid NOT NULL,
  recording_url text NOT NULL,
  duration_seconds integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view recordings"
  ON public.session_recordings FOR SELECT
  TO authenticated
  USING (auth.uid() = coach_user_id OR auth.uid() = athlete_user_id);

CREATE POLICY "Coaches can create recordings"
  ON public.session_recordings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = coach_user_id);

CREATE TRIGGER update_coaching_messages_updated_at
  BEFORE UPDATE ON public.coaching_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();