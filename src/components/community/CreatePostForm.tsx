import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Image, Video, Send, X, Loader2 } from "lucide-react";
import MentionInput from "./MentionInput";
import { createNotification, getActorName, extractMentions, getMentionedUserIds } from "@/lib/notifications";

interface CreatePostFormProps {
  userId: string;
  onPostCreated?: () => void;
}

const CreatePostForm = ({ userId, onPostCreated }: CreatePostFormProps) => {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<string>("progress");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please write something to share");
      return;
    }

    setIsSubmitting(true);

    try {
      let mediaUrl = null;

      // Upload media if present
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('community-media')
          .upload(fileName, mediaFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('community-media')
          .getPublicUrl(fileName);

        mediaUrl = publicUrl;
      }

      // Create post
      const { data: postData, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: userId,
          content: content.trim(),
          post_type: postType,
          media_url: mediaUrl
        })
        .select()
        .single();

      if (error) throw error;

      // Send mention notifications
      const mentions = extractMentions(content);
      if (mentions.length > 0) {
        const mentionedUserIds = await getMentionedUserIds(mentions);
        const actorName = await getActorName(userId);
        
        for (const mentionedUserId of mentionedUserIds) {
          await createNotification({
            userId: mentionedUserId,
            type: 'mention',
            title: `${actorName} mentioned you`,
            message: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
            postId: postData.id,
            actorId: userId
          });
        }
      }

      toast.success("Post shared with the community!");
      setContent("");
      setPostType("progress");
      removeMedia();
      onPostCreated?.();
      
      // Trigger a refresh of the feed
      window.dispatchEvent(new CustomEvent('post-created'));
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 border-border bg-card">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-semibold text-sm">You</span>
          </div>
          
          <div className="flex-1 space-y-4">
            <MentionInput
              placeholder="Share your progress, game highlights, or recruiting updates... Use @ to mention teammates"
              value={content}
              onChange={setContent}
            />

            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative inline-block">
                {mediaFile?.type.startsWith('video/') ? (
                  <video 
                    src={mediaPreview} 
                    className="max-h-48 rounded-lg"
                    controls
                  />
                ) : (
                  <img 
                    src={mediaPreview} 
                    alt="Preview" 
                    className="max-h-48 rounded-lg object-cover"
                  />
                )}
                <button
                  onClick={removeMedia}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Image className="w-4 h-4" />
                  <span className="hidden sm:inline">Photo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "video/*";
                      fileInputRef.current.click();
                      fileInputRef.current.accept = "image/*,video/*";
                    }
                  }}
                  className="gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">Video</span>
                </Button>

                <Select value={postType} onValueChange={setPostType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="game_clip">Game Clip</SelectItem>
                    <SelectItem value="recruiting">Recruiting</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !content.trim()}
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;
