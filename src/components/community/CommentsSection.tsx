import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import MentionInput from "./MentionInput";
import MentionText from "./MentionText";
import { createNotification, getActorName, extractMentions, getMentionedUserIds } from "@/lib/notifications";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
}

interface CommentsSectionProps {
  postId: string;
  postOwnerId: string;
  currentUserId: string;
  onCommentsCountChange: (count: number) => void;
}

const CommentsSection = ({ postId, postOwnerId, currentUserId, onCommentsCountChange }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        onCommentsCountChange(0);
        setLoading(false);
        return;
      }

      // Get author names using secure RPC function
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profilesData } = await supabase
        .rpc('get_public_profiles_by_ids', { user_ids: userIds });

      const profiles = (profilesData || []) as Array<{ user_id: string; display_name: string }>;
      const profileMap = new Map(profiles.map(p => [p.user_id, p.display_name]));

      const enrichedComments: Comment[] = commentsData.map(comment => ({
        ...comment,
        author_name: profileMap.get(comment.user_id) || 'Anonymous'
      }));

      setComments(enrichedComments);
      onCommentsCountChange(enrichedComments.length);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: newComment.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Get current user's name using secure RPC function
      const actorName = await getActorName(currentUserId);

      // Notify post owner about the comment
      if (postOwnerId !== currentUserId) {
        await createNotification({
          userId: postOwnerId,
          type: 'comment',
          title: `${actorName} commented on your post`,
          message: newComment.slice(0, 100) + (newComment.length > 100 ? '...' : ''),
          postId,
          actorId: currentUserId
        });
      }

      // Notify mentioned users
      const mentions = extractMentions(newComment);
      if (mentions.length > 0) {
        const mentionedUserIds = await getMentionedUserIds(mentions);
        
        for (const mentionedUserId of mentionedUserIds) {
          if (mentionedUserId !== currentUserId) {
            await createNotification({
              userId: mentionedUserId,
              type: 'mention',
              title: `${actorName} mentioned you in a comment`,
              message: newComment.slice(0, 100) + (newComment.length > 100 ? '...' : ''),
              postId,
              actorId: currentUserId
            });
          }
        }
      }

      const newCommentWithAuthor: Comment = {
        ...data,
        author_name: actorName
      };

      setComments(prev => [...prev, newCommentWithAuthor]);
      onCommentsCountChange(comments.length + 1);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      onCommentsCountChange(comments.length - 1);
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4 w-full">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 border-t border-border pt-4">
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-muted-foreground font-medium text-xs">
                  {comment.author_name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-sm text-foreground mt-1">
                    <MentionText content={comment.content} />
                  </div>
                </div>
              </div>
              {comment.user_id === currentUserId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(comment.id)}
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <MentionInput
            value={newComment}
            onChange={setNewComment}
            placeholder="Write a comment... Use @ to mention"
            minHeight="40px"
            className="min-h-[40px]"
          />
        </div>
        <Button type="submit" size="icon" disabled={submitting || !newComment.trim()}>
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default CommentsSection;