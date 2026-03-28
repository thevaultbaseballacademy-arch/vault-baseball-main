import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/community/PostCard";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createNotification, getActorName } from "@/lib/notifications";

interface Post {
  id: string;
  user_id: string;
  content: string;
  post_type: string;
  media_url: string | null;
  created_at: string;
  author_name?: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

interface ProfilePostsProps {
  userId: string;
  currentUserId?: string;
  filterType?: string;
}

const ProfilePosts = ({ userId, currentUserId, filterType }: ProfilePostsProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filterType) {
        query = query.eq('post_type', filterType);
      }

      const { data: postsData, error } = await query;

      if (error) throw error;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Get author name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', userId)
        .maybeSingle();

      const authorName = profile?.display_name || 'Anonymous';

      // Get likes
      const postIds = postsData.map(p => p.id);
      const { data: likesData } = await supabase
        .from('community_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      const likesCountMap = new Map<string, number>();
      const userLikesSet = new Set<string>();
      
      likesData?.forEach(like => {
        likesCountMap.set(like.post_id, (likesCountMap.get(like.post_id) || 0) + 1);
        if (like.user_id === currentUserId) {
          userLikesSet.add(like.post_id);
        }
      });

      // Get comments counts
      const { data: commentsData } = await supabase
        .from('community_comments')
        .select('post_id')
        .in('post_id', postIds);

      const commentsCountMap = new Map<string, number>();
      commentsData?.forEach(comment => {
        commentsCountMap.set(comment.post_id, (commentsCountMap.get(comment.post_id) || 0) + 1);
      });

      const enrichedPosts: Post[] = postsData.map(post => ({
        ...post,
        author_name: authorName,
        likes_count: likesCountMap.get(post.id) || 0,
        comments_count: commentsCountMap.get(post.id) || 0,
        is_liked: userLikesSet.has(post.id)
      }));

      setPosts(enrichedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId, filterType, currentUserId]);

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    if (!currentUserId) return;

    try {
      if (isLiked) {
        await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);
      } else {
        await supabase
          .from('community_likes')
          .insert({ post_id: postId, user_id: currentUserId });

        // Send notification to post owner
        const post = posts.find(p => p.id === postId);
        if (post && post.user_id !== currentUserId) {
          const actorName = await getActorName(currentUserId);
          await createNotification({
            userId: post.user_id,
            type: 'like',
            title: `${actorName} liked your post`,
            message: post.content.slice(0, 100) + (post.content.length > 100 ? '...' : ''),
            postId,
            actorId: currentUserId
          });
        }
      }

      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: !isLiked,
            likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
          };
        }
        return post;
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {filterType === 'recruiting' 
              ? "No recruiting highlights yet."
              : "No posts yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId || ''}
          onLikeToggle={handleLikeToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default ProfilePosts;
