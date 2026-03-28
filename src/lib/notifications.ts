import { supabase } from "@/integrations/supabase/client";

interface CreateNotificationParams {
  userId: string;
  type: 'like' | 'comment' | 'mention' | 'coach_feedback';
  title: string;
  message: string;
  postId?: string;
  actorId: string;
}

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  postId,
  actorId
}: CreateNotificationParams) => {
  // Don't notify yourself
  if (userId === actorId) return;

  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        post_id: postId,
        actor_id: actorId
      });

    if (error) {
      console.error("Error creating notification:", error);
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

export const getActorName = async (actorId: string): Promise<string> => {
  // Use secure RPC function to get public profile data
  const { data } = await supabase
    .rpc('get_public_profile', { target_user_id: actorId });

  // get_public_profile returns an array with one row
  const profiles = data as Array<{ display_name: string }> | null;
  return profiles && profiles.length > 0 ? profiles[0].display_name || 'Someone' : 'Someone';
};

export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+(?:\s\w+)?)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
};

export const getMentionedUserIds = async (mentionNames: string[]): Promise<string[]> => {
  if (mentionNames.length === 0) return [];

  const userIds: string[] = [];
  
  // Use secure RPC function to search for each mentioned name
  for (const mentionName of mentionNames) {
    const { data } = await supabase
      .rpc('search_public_profiles', { search_term: mentionName, result_limit: 1 });
    
    if (data && data.length > 0) {
      const profile = data[0] as { user_id: string; display_name: string };
      if (profile.display_name && profile.display_name.toLowerCase() === mentionName.toLowerCase()) {
        userIds.push(profile.user_id);
      }
    }
  }

  return userIds;
};