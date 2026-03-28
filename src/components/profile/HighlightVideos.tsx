import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Video, Plus, Loader2, Trash2, Play, X, Globe, Users, Lock } from "lucide-react";
import { format } from "date-fns";

type PrivacyLevel = 'public' | 'coaches_only' | 'private';

interface HighlightVideo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  privacy_level: PrivacyLevel;
  created_at: string;
  signedUrl?: string;
}

interface HighlightVideosProps {
  userId: string;
  isOwnProfile: boolean;
}

const privacyOptions: { value: PrivacyLevel; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'public', label: 'Public', icon: <Globe className="w-4 h-4" />, description: 'Anyone can view' },
  { value: 'coaches_only', label: 'Coaches Only', icon: <Users className="w-4 h-4" />, description: 'Only your assigned coaches' },
  { value: 'private', label: 'Private', icon: <Lock className="w-4 h-4" />, description: 'Only you can view' },
];

/**
 * Helper: extract the storage path from a video_url that was created using getPublicUrl.
 * Example URL: https://<project>.supabase.co/storage/v1/object/public/highlight-videos/<user_id>/<file>
 */
const extractStoragePath = (publicUrl: string): string | null => {
  const bucketMarker = "/highlight-videos/";
  const idx = publicUrl.indexOf(bucketMarker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + bucketMarker.length);
};

const HighlightVideos = ({ userId, isOwnProfile }: HighlightVideosProps) => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('public');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['highlight-videos', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('highlight_videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const videosRaw = (data || []).map(video => ({
        ...video,
        privacy_level: (video as any).privacy_level || 'public'
      })) as HighlightVideo[];

      // Fetch signed URLs for each video (1-hour expiry)
      const videosWithSignedUrls: HighlightVideo[] = await Promise.all(
        videosRaw.map(async (video) => {
          const storagePath = extractStoragePath(video.video_url);
          if (!storagePath) return video;

          const { data: signedData } = await supabase.storage
            .from('highlight-videos')
            .createSignedUrl(storagePath, 3600);

          return { ...video, signedUrl: signedData?.signedUrl ?? undefined };
        })
      );

      return videosWithSignedUrls;
    }
  });

  const deleteVideo = useMutation({
    mutationFn: async (video: HighlightVideo) => {
      const videoPath = video.video_url.split('/highlight-videos/')[1];
      if (videoPath) {
        await supabase.storage.from('highlight-videos').remove([videoPath]);
      }

      const { error } = await supabase
        .from('highlight_videos')
        .delete()
        .eq('id', video.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlight-videos', userId] });
      toast.success('Video deleted');
    },
    onError: () => {
      toast.error('Failed to delete video');
    }
  });

  const updatePrivacy = useMutation({
    mutationFn: async ({ videoId, privacy }: { videoId: string; privacy: PrivacyLevel }) => {
      const { error } = await supabase
        .from('highlight_videos')
        .update({ privacy_level: privacy } as any)
        .eq('id', videoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlight-videos', userId] });
      toast.success('Privacy updated');
    },
    onError: () => {
      toast.error('Failed to update privacy');
    }
  });

  const updateAllPrivacy = useMutation({
    mutationFn: async (privacy: PrivacyLevel) => {
      const { error } = await supabase
        .from('highlight_videos')
        .update({ privacy_level: privacy } as any)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlight-videos', userId] });
      toast.success('All videos updated');
    },
    onError: () => {
      toast.error('Failed to update videos');
    }
  });

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast.error('Please provide a title and select a video');
      return;
    }

    setUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `video-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('highlight-videos')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('highlight-videos')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('highlight_videos')
        .insert({
          user_id: userId,
          title: title.trim(),
          description: description.trim() || null,
          video_url: publicUrl,
          privacy_level: privacyLevel
        } as any);

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['highlight-videos', userId] });
      toast.success('Video uploaded successfully!');
      
      setTitle("");
      setDescription("");
      setPrivacyLevel('public');
      setSelectedFile(null);
      setUploadOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const getPrivacyIcon = (privacy: PrivacyLevel) => {
    const option = privacyOptions.find(o => o.value === privacy);
    return option?.icon || <Globe className="w-4 h-4" />;
  };

  const getPrivacyLabel = (privacy: PrivacyLevel) => {
    const option = privacyOptions.find(o => o.value === privacy);
    return option?.label || 'Public';
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Highlight Videos
          </CardTitle>
          {isOwnProfile && (
            <div className="flex items-center gap-2">
              {videos.length > 1 && (
                <Select onValueChange={(v) => updateAllPrivacy.mutate(v as PrivacyLevel)}>
                  <SelectTrigger className="w-auto h-8 text-xs gap-1">
                    <span>Set All</span>
                  </SelectTrigger>
                  <SelectContent>
                    {privacyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Upload Highlight Video</DialogTitle>
                    <DialogDescription>
                      Share your best plays with college recruiters. Max file size: 100MB.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="video-title">Title *</Label>
                      <Input
                        id="video-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Game-winning home run vs. State"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="video-description">Description</Label>
                      <Textarea
                        id="video-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add context about this highlight..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Privacy</Label>
                      <Select value={privacyLevel} onValueChange={(v) => setPrivacyLevel(v as PrivacyLevel)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {privacyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {option.icon}
                                <span>{option.label}</span>
                                <span className="text-muted-foreground text-xs">- {option.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Video File *</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-muted-foreground
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-primary file:text-primary-foreground
                          hover:file:bg-primary/90
                          file:cursor-pointer cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="text-xs text-muted-foreground">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setUploadOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={uploading}>
                      {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Upload Video
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {videos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No highlight videos yet</p>
              {isOwnProfile && (
                <p className="text-sm mt-1">Upload your best plays to impress recruiters</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="group relative rounded-lg border border-border bg-muted/30 overflow-hidden"
                >
                  <div className="aspect-video bg-black relative">
                    <video
                      src={video.signedUrl || video.video_url}
                      className="w-full h-full object-contain"
                      controls={playingVideo === video.id}
                      poster={video.thumbnail_url || undefined}
                    />
                    {playingVideo !== video.id && (
                      <button
                        onClick={() => setPlayingVideo(video.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                      >
                        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-primary-foreground ml-1" />
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-foreground truncate flex-1">{video.title}</h4>
                      {isOwnProfile ? (
                        <Select 
                          value={video.privacy_level} 
                          onValueChange={(v) => updatePrivacy.mutate({ videoId: video.id, privacy: v as PrivacyLevel })}
                        >
                          <SelectTrigger className="w-auto h-7 px-2 text-xs gap-1">
                            {getPrivacyIcon(video.privacy_level)}
                            <span className="hidden sm:inline">{getPrivacyLabel(video.privacy_level)}</span>
                          </SelectTrigger>
                          <SelectContent>
                            {privacyOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  {option.icon}
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getPrivacyIcon(video.privacy_level)}
                        </div>
                      )}
                    </div>
                    {video.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {video.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(video.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>

                  {isOwnProfile && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={() => deleteVideo.mutate(video)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {playingVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPlayingVideo(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={() => setPlayingVideo(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <video
              src={videos.find(v => v.id === playingVideo)?.signedUrl || videos.find(v => v.id === playingVideo)?.video_url}
              className="w-full rounded-lg"
              controls
              autoPlay
            />
          </div>
        </div>
      )}
    </>
  );
};

export default HighlightVideos;
