import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Trash2, Edit2, Save, X, Lightbulb, 
  Eye, EyeOff, GripVertical, Loader2, Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WeeklyTip {
  id: string;
  title: string;
  content: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  expires_at: string | null;
}

const CATEGORIES = [
  { value: 'training', label: 'Training' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'mindset', label: 'Mindset' },
  { value: 'technique', label: 'Technique' },
  { value: 'general', label: 'General' },
];

const WeeklyTipsManager = () => {
  const [tips, setTips] = useState<WeeklyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTip, setEditingTip] = useState<WeeklyTip | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    is_active: true,
    expires_at: '',
  });

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_tips')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTips(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load tips",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      is_active: true,
      expires_at: '',
    });
    setEditingTip(null);
    setIsCreating(false);
  };

  const handleEdit = (tip: WeeklyTip) => {
    setEditingTip(tip);
    setFormData({
      title: tip.title,
      content: tip.content,
      category: tip.category,
      is_active: tip.is_active,
      expires_at: tip.expires_at ? tip.expires_at.split('T')[0] : '',
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const tipData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        is_active: formData.is_active,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      };

      if (editingTip) {
        // Update existing
        const { error } = await supabase
          .from('weekly_tips')
          .update(tipData)
          .eq('id', editingTip.id);

        if (error) throw error;
        toast({ title: "Success", description: "Tip updated successfully" });
      } else {
        // Create new
        const maxOrder = tips.length > 0 
          ? Math.max(...tips.map(t => t.display_order)) + 1 
          : 0;

        const { error } = await supabase
          .from('weekly_tips')
          .insert({ ...tipData, display_order: maxOrder });

        if (error) throw error;
        toast({ title: "Success", description: "Tip created successfully" });
      }

      resetForm();
      fetchTips();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save tip",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tip?')) return;

    try {
      const { error } = await supabase
        .from('weekly_tips')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Deleted", description: "Tip deleted successfully" });
      fetchTips();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tip",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (tip: WeeklyTip) => {
    try {
      const { error } = await supabase
        .from('weekly_tips')
        .update({ is_active: !tip.is_active })
        .eq('id', tip.id);

      if (error) throw error;
      fetchTips();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to toggle tip status",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'training': return 'bg-accent/10 text-accent';
      case 'recovery': return 'bg-blue-500/10 text-blue-500';
      case 'nutrition': return 'bg-green-500/10 text-green-500';
      case 'mindset': return 'bg-purple-500/10 text-purple-500';
      case 'technique': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  // Filter tips by category and search query
  const filteredTips = tips.filter(tip => {
    const matchesCategory = categoryFilter === 'all' || tip.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get counts per category
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = tips.filter(t => t.category === cat.value).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display text-foreground">Weekly Tips Manager</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage tips that appear on the dashboard
          </p>
        </div>
        <Button variant="vault" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tip
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingTip) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-foreground">
              {editingTip ? 'Edit Tip' : 'Create New Tip'}
            </h3>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Tip title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your tip content..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expires">Expires At (optional)</Label>
              <Input
                id="expires"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="active">Active (visible on dashboard)</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button variant="vault" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingTip ? 'Update' : 'Create'} Tip
            </Button>
          </div>
        </motion.div>
      )}

      {/* Search and Category Filter */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tips by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            All ({tips.length})
          </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === cat.value
                ? getCategoryColor(cat.value) + ' ring-1 ring-current'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            {cat.label} ({categoryCounts[cat.value] || 0})
          </button>
        ))}
        </div>
      </div>

      {/* Tips List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-display text-foreground">
            {categoryFilter === 'all' ? 'All Tips' : `${CATEGORIES.find(c => c.value === categoryFilter)?.label} Tips`} ({filteredTips.length})
          </h3>
          {categoryFilter !== 'all' && (
            <button
              onClick={() => setCategoryFilter('all')}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear filter
            </button>
          )}
        </div>

        {filteredTips.length === 0 ? (
          <div className="p-8 text-center">
            <Lightbulb className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {categoryFilter === 'all' 
                ? 'No tips created yet' 
                : `No ${CATEGORIES.find(c => c.value === categoryFilter)?.label.toLowerCase()} tips found`}
            </p>
            {categoryFilter === 'all' ? (
              <Button variant="outline" className="mt-4" onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Tip
              </Button>
            ) : (
              <Button variant="outline" className="mt-4" onClick={() => setCategoryFilter('all')}>
                View All Tips
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTips.map((tip) => (
              <div
                key={tip.id}
                className={`p-4 flex items-start gap-4 ${!tip.is_active ? 'opacity-50' : ''}`}
              >
                <div className="flex-shrink-0 pt-1">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">{tip.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(tip.category)}`}>
                      {tip.category}
                    </span>
                    {!tip.is_active && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{tip.content}</p>
                  {tip.expires_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {new Date(tip.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(tip)}
                    title={tip.is_active ? 'Hide' : 'Show'}
                  >
                    {tip.is_active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(tip)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tip.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Tips & Best Practices:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Keep tips concise and actionable</li>
          <li>Use categories to organize tips by topic</li>
          <li>Set expiration dates for time-sensitive tips</li>
          <li>Toggle visibility to preview tips before publishing</li>
        </ul>
      </div>
    </div>
  );
};

export default WeeklyTipsManager;