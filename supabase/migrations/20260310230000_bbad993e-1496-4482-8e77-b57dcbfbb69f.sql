-- Update the type check constraint to include all notification types
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
  type = ANY (ARRAY[
    'like', 'comment', 'mention', 'coach_feedback',
    'course_update', 'coach_message',
    'community_like', 'community_comment', 'community_mention',
    'lesson_booked', 'lesson_confirmed', 'lesson_cancelled', 'lesson_completed', 'lesson_link_added',
    'lesson_recap', 'availability_update'
  ]::text[])
);
