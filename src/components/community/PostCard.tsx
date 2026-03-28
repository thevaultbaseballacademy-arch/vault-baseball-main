import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Trash2, Trophy, Video, GraduationCap, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CommentsSection from "./CommentsSection";
import MentionText from "./MentionText";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onLikeToggle: (postId: string, isLiked: boolean) => void;
  onDelete: (postId: string) => void;
}

const postTypeConfig = {
  progress: { icon: Trophy, label: "Progress", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  game_clip: { icon: Video, label: "Game Clip", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  recruiting: { icon: GraduationCap, label: "Recruiting", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  general: { icon: MessageCircle, label: "General", color: "bg-muted text-muted-foreground border-border" }
};

const PostCard = ({ post, currentUserId, onLikeToggle, onDelete }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  
  const isOwner = post.user_id === currentUserId;
  const typeConfig = postTypeConfig[post.post_type as keyof typeof postTypeConfig] || postTypeConfig.general;
  const TypeIcon = typeConfig.icon;

  const isVideo = post.media_url?.match(/\.(mp4|webm|mov|avi)$/i);

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <span className="text-primary font-semibold text-sm">
                {post.author_name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                {post.author_name || 'Anonymous'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${typeConfig.color} text-xs`}>
              <TypeIcon className="w-3 h-3 mr-1" />
              {typeConfig.label}
            </Badge>
            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Post</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this post? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(post.id)} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <MentionText content={post.content} />
        
        {post.media_url && (
          <div className="mt-4 rounded-lg overflow-hidden bg-muted">
            {isVideo ? (
              <video 
                src={post.media_url} 
                controls 
                className="w-full max-h-[400px] object-contain"
              />
            ) : (
              <img 
                src={post.media_url} 
                alt="Post media" 
                className="w-full max-h-[400px] object-contain"
              />
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-0">
        <div className="flex items-center gap-4 w-full border-t border-border pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLikeToggle(post.id, post.is_liked)}
            className={`gap-2 ${post.is_liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
          >
            <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
            {post.likes_count}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-2 text-muted-foreground"
          >
            <MessageCircle className="w-4 h-4" />
            {commentsCount}
          </Button>
        </div>

        {showComments && (
          <CommentsSection 
            postId={post.id}
            postOwnerId={post.user_id}
            currentUserId={currentUserId}
            onCommentsCountChange={setCommentsCount}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
