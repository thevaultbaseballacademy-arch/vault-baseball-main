import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Share2, Copy, Trash2, Eye, Link2, Calendar, Plus, QrCode, Download, X, Tag, Pencil, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareToken {
  id: string;
  token: string;
  label: string | null;
  expires_at: string | null;
  include_goals: boolean;
  include_stats: boolean;
  include_videos: boolean;
  view_count: number;
  created_at: string;
}

interface KPIShareManagerProps {
  userId: string;
}

const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function KPIShareManager({ userId }: KPIShareManagerProps) {
  const [tokens, setTokens] = useState<ShareToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [qrToken, setQrToken] = useState<ShareToken | null>(null);
  const [editingTokenId, setEditingTokenId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  
  // New token settings
  const [label, setLabel] = useState("");
  const [includeGoals, setIncludeGoals] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [includeVideos, setIncludeVideos] = useState(false);
  const [expiration, setExpiration] = useState("never");

  useEffect(() => {
    fetchTokens();
  }, [userId]);

  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from('kpi_share_tokens' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching share tokens:', error);
    } else {
      setTokens((data as unknown as ShareToken[]) || []);
    }
    setLoading(false);
  };

  const createShareLink = async () => {
    setCreating(true);
    
    let expiresAt: string | null = null;
    if (expiration !== "never") {
      const date = new Date();
      switch (expiration) {
        case "7days":
          date.setDate(date.getDate() + 7);
          break;
        case "30days":
          date.setDate(date.getDate() + 30);
          break;
        case "90days":
          date.setDate(date.getDate() + 90);
          break;
      }
      expiresAt = date.toISOString();
    }

    const token = generateToken();
    
    const { error } = await supabase
      .from('kpi_share_tokens' as any)
      .insert({
        user_id: userId,
        token,
        label: label.trim() || null,
        expires_at: expiresAt,
        include_goals: includeGoals,
        include_stats: includeStats,
        include_videos: includeVideos,
      });

    if (error) {
      toast.error("Failed to create share link");
      console.error(error);
    } else {
      toast.success("Share link created!");
      setShowCreateForm(false);
      setLabel("");
      fetchTokens();
    }
    setCreating(false);
  };

  const deleteToken = async (id: string) => {
    const { error } = await supabase
      .from('kpi_share_tokens' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete share link");
    } else {
      toast.success("Share link deleted");
      setTokens(tokens.filter(t => t.id !== id));
    }
  };

  const startEditingLabel = (token: ShareToken) => {
    setEditingTokenId(token.id);
    setEditLabel(token.label || "");
  };

  const saveLabel = async (tokenId: string) => {
    const { error } = await supabase
      .from('kpi_share_tokens' as any)
      .update({ label: editLabel.trim() || null })
      .eq('id', tokenId);

    if (error) {
      toast.error("Failed to update label");
    } else {
      toast.success("Label updated!");
      setTokens(tokens.map(t => 
        t.id === tokenId ? { ...t, label: editLabel.trim() || null } : t
      ));
    }
    setEditingTokenId(null);
    setEditLabel("");
  };

  const cancelEditing = () => {
    setEditingTokenId(null);
    setEditLabel("");
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === tokens.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tokens.map(t => t.id)));
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    setBulkDeleting(true);
    const idsToDelete = Array.from(selectedIds);
    
    const { error } = await supabase
      .from('kpi_share_tokens' as any)
      .delete()
      .in('id', idsToDelete);

    if (error) {
      toast.error("Failed to delete selected links");
    } else {
      toast.success(`${idsToDelete.length} link${idsToDelete.length > 1 ? 's' : ''} deleted`);
      setTokens(tokens.filter(t => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
    }
    setBulkDeleting(false);
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getShareUrl = (token: string) => `${window.location.origin}/shared/${token}`;

  const downloadQRCode = (token: ShareToken) => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 480;
      
      if (ctx) {
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code centered
        ctx.drawImage(img, 50, 30, 300, 300);
        
        // Add text below
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Scan to view my profile', canvas.width / 2, 370);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText('Vault Baseball', canvas.width / 2, 400);
        
        if (token.expires_at) {
          ctx.font = '12px Arial';
          ctx.fillText(`Valid until ${format(new Date(token.expires_at), 'MMM d, yyyy')}`, canvas.width / 2, 430);
        }
      }

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `profile-qr-${token.token.substring(0, 8)}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast.success("QR code downloaded!");
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading share links...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Recruiter Share Links
            </CardTitle>
            <CardDescription>
              Generate shareable links for recruiters and scouts to view your performance data
            </CardDescription>
          </div>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Link
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCreateForm && (
          <Card className="border-dashed">
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-label">Label (optional)</Label>
                <Input
                  id="link-label"
                  placeholder="e.g., Stanford Showcase 2026, Coach Smith"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  Add a label to organize links by event or recruiter
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-stats">Include KPI Stats</Label>
                  <Switch
                    id="include-stats"
                    checked={includeStats}
                    onCheckedChange={setIncludeStats}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-goals">Include Goals</Label>
                  <Switch
                    id="include-goals"
                    checked={includeGoals}
                    onCheckedChange={setIncludeGoals}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-videos">Include Highlight Videos</Label>
                  <Switch
                    id="include-videos"
                    checked={includeVideos}
                    onCheckedChange={setIncludeVideos}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link Expiration</Label>
                  <Select value={expiration} onValueChange={setExpiration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never expires</SelectItem>
                      <SelectItem value="7days">7 days</SelectItem>
                      <SelectItem value="30days">30 days</SelectItem>
                      <SelectItem value="90days">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={createShareLink} disabled={creating}>
                  {creating ? "Creating..." : "Generate Link"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {tokens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No share links created yet</p>
            <p className="text-sm">Create a link to share your KPIs with recruiters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Bulk actions bar */}
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.size === tokens.length && tokens.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size > 0 
                    ? `${selectedIds.size} selected`
                    : "Select all"}
                </span>
              </div>
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteSelected}
                  disabled={bulkDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {bulkDeleting ? "Deleting..." : `Delete (${selectedIds.size})`}
                </Button>
              )}
            </div>
            
            {tokens.map((token) => (
              <div
                key={token.id}
                className={`flex items-center gap-3 p-4 rounded-lg border ${
                  isExpired(token.expires_at) ? 'bg-muted/50 opacity-60' : 'bg-card'
                } ${selectedIds.has(token.id) ? 'ring-2 ring-primary' : ''}`}
              >
                <Checkbox
                  checked={selectedIds.has(token.id)}
                  onCheckedChange={() => toggleSelection(token.id)}
                  aria-label={`Select ${token.label || token.token.substring(0, 8)}`}
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {editingTokenId === token.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="Enter label..."
                          className="h-8 text-sm"
                          maxLength={100}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveLabel(token.id);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveLabel(token.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditing}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        {token.label ? (
                          <span className="font-medium flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {token.label}
                          </span>
                        ) : (
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {token.token.substring(0, 8)}...
                          </code>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingLabel(token)}
                          className="h-6 w-6 p-0"
                          title="Edit label"
                        >
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                        </Button>
                        {isExpired(token.expires_at) ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {token.view_count} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {token.expires_at
                        ? `Expires ${format(new Date(token.expires_at), 'MMM d, yyyy')}`
                        : 'Never expires'}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {token.include_stats && <Badge variant="outline">Stats</Badge>}
                    {token.include_goals && <Badge variant="outline">Goals</Badge>}
                    {token.include_videos && <Badge variant="outline">Videos</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQrToken(token)}
                    disabled={isExpired(token.expires_at)}
                    title="Show QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(token.token)}
                    disabled={isExpired(token.expires_at)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteToken(token.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* QR Code Dialog */}
      <Dialog open={!!qrToken} onOpenChange={(open) => !open && setQrToken(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code for Recruiters
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div 
              ref={qrRef}
              className="bg-white p-6 rounded-lg shadow-inner"
            >
              {qrToken && (
                <QRCodeSVG
                  value={getShareUrl(qrToken.token)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Recruiters can scan this QR code to view your profile
            </p>
            {qrToken?.expires_at && (
              <p className="text-xs text-muted-foreground">
                Valid until {format(new Date(qrToken.expires_at), 'MMMM d, yyyy')}
              </p>
            )}
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => qrToken && copyLink(qrToken.token)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button
                className="flex-1"
                onClick={() => qrToken && downloadQRCode(qrToken)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
