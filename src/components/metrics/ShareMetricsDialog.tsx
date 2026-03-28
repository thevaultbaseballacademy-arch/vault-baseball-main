import { useState } from "react";
import { Share2, Copy, Link2, Mail, Trash2, Eye, Globe, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetricShareTokens, useCreateShareToken, useDeleteShareToken } from "@/hooks/useDeviceMetrics";
import { toast } from "sonner";

interface ShareMetricsDialogProps {
  userId: string;
}

export function ShareMetricsDialog({ userId }: ShareMetricsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [label, setLabel] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [includePitching, setIncludePitching] = useState(true);
  const [includeHitting, setIncludeHitting] = useState(true);
  const [includeThrowing, setIncludeThrowing] = useState(true);
  const [includeTrends, setIncludeTrends] = useState(true);
  
  const { data: tokens = [], isLoading } = useMetricShareTokens(userId);
  const createToken = useCreateShareToken();
  const deleteToken = useDeleteShareToken();
  
  const generateToken = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };
  
  const handleCreate = async () => {
    const newToken = generateToken();
    
    await createToken.mutateAsync({
      user_id: userId,
      token: newToken,
      label: label || (isPublic ? 'Public Profile' : `For ${recipientName || 'Recruiter'}`),
      is_public: isPublic,
      recipient_name: isPublic ? undefined : recipientName,
      recipient_email: isPublic ? undefined : recipientEmail,
      include_pitching: includePitching,
      include_hitting: includeHitting,
      include_throwing: includeThrowing,
      include_trends: includeTrends
    });
    
    // Reset form
    setLabel("");
    setRecipientName("");
    setRecipientEmail("");
  };
  
  const copyLink = (token: string) => {
    const url = `${window.location.origin}/shared-metrics/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Metrics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wider">
            Share Your Metrics
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create new share */}
          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-display uppercase tracking-wider">
                Create Share Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div 
                  className={`flex items-center gap-2 px-4 py-2 border cursor-pointer transition-colors ${isPublic ? 'border-primary bg-primary/10' : 'border-border'}`}
                  onClick={() => setIsPublic(true)}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Public Link</span>
                </div>
                <div 
                  className={`flex items-center gap-2 px-4 py-2 border cursor-pointer transition-colors ${!isPublic ? 'border-primary bg-primary/10' : 'border-border'}`}
                  onClick={() => setIsPublic(false)}
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Recruiter Code</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Label (optional)</Label>
                <Input 
                  placeholder={isPublic ? "e.g., My Public Profile" : "e.g., Coach Smith - Texas State"}
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              
              {!isPublic && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recruiter Name</Label>
                    <Input 
                      placeholder="Coach name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (optional)</Label>
                    <Input 
                      type="email"
                      placeholder="coach@school.edu"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label>Pitching Metrics</Label>
                  <Switch checked={includePitching} onCheckedChange={setIncludePitching} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Hitting Metrics</Label>
                  <Switch checked={includeHitting} onCheckedChange={setIncludeHitting} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Throwing Metrics</Label>
                  <Switch checked={includeThrowing} onCheckedChange={setIncludeThrowing} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Trends</Label>
                  <Switch checked={includeTrends} onCheckedChange={setIncludeTrends} />
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleCreate}
                disabled={createToken.isPending}
              >
                {createToken.isPending ? 'Creating...' : 'Create Share Link'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Existing shares */}
          <div className="space-y-3">
            <h4 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
              Active Share Links
            </h4>
            
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No share links created yet
              </div>
            ) : (
              <div className="space-y-2">
                {tokens.map((token) => (
                  <motion.div
                    key={token.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-card border border-border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {token.is_public ? (
                          <Globe className="w-4 h-4 text-primary" />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm">{token.label || 'Untitled'}</span>
                        <Badge variant="secondary" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          {token.view_count}
                        </Badge>
                      </div>
                      {token.recipient_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          For: {token.recipient_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLink(token.token)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteToken.mutate(token.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
