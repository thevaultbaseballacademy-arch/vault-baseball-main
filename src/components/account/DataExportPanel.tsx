import { useState } from "react";
import { Download, Loader2, FileJson, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DataExportPanel = () => {
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Please log in to export your data",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('export-user-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Create and download the JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vault-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExport(new Date().toISOString());
      toast({
        title: "Export Complete",
        description: "Your personal data has been downloaded successfully",
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export your data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display text-foreground">Data Export</h2>
          <p className="text-muted-foreground text-sm">Download your personal data (GDPR)</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Your Rights Under GDPR</p>
              <p>
                You have the right to receive a copy of all personal data we hold about you. 
                This export includes your profile, activity, certifications, and preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-secondary/50 rounded-xl p-4">
          <p className="text-sm font-medium text-foreground mb-2">Data included in export:</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Profile information</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Athletic stats & KPIs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Course progress</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Certifications</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Community activity</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Purchase history</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Notification settings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Session history</span>
            </div>
          </div>
        </div>

        {lastExport && (
          <p className="text-sm text-muted-foreground">
            Last export: {new Date(lastExport).toLocaleString()}
          </p>
        )}

        <Button
          onClick={handleExport}
          disabled={exporting}
          className="w-full md:w-auto"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparing Export...
            </>
          ) : (
            <>
              <FileJson className="w-4 h-4 mr-2" />
              Download My Data
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DataExportPanel;
