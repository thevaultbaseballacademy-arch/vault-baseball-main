import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "./PostCard";
import { Loader2 } from "lucide-react";
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

interface CommunityFeedProps {
  currentUserId: string;
  filter?: string;
}

const CommunityFeed = ({ currentUserId, filter }: CommunityFeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter) {
        query = query.eq('post_type', filter);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Get author names using secure RPC function
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .rpc('get_public_profiles_by_ids', { user_ids: userIds });

      const profiles = (profilesData || []) as Array<{ user_id: string; display_name: string }>;
      const profileMap = new Map(profiles.map(p => [p.user_id, p.display_name]));

      // Get likes counts
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

      // Combine data
      const enrichedPosts: Post[] = postsData.map(post => ({
        ...post,
        author_name: profileMap.get(post.user_id) || 'Anonymous',
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

    // Listen for new posts
    const handleNewPost = () => fetchPosts();
    window.addEventListener('post-created', handleNewPost);

    return () => {
      window.removeEventListener('post-created', handleNewPost);
    };
  }, [filter, currentUserId]);

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
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

      // Update local state
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
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onLikeToggle={handleLikeToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default CommunityFeed;