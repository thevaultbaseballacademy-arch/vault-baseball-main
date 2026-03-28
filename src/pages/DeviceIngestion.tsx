import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Upload, Zap, Shield, Plus, Check, Clock,
  FileSpreadsheet, Loader2, ChevronRight, Database, Download,
  AlertTriangle, CheckCircle2, Info, X, RefreshCw, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDeviceIngestion, SOURCE_KPI_PRESETS } from "@/hooks/useDeviceIngestion";
import { DataSource, SOURCE_LABELS, DEVICE_CONFIG } from "@/types/deviceMetrics";
import { parseDeviceCSV, generateCSVTemplate, type ParsedRow } from "@/lib/deviceParsers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEVICE_DESCRIPTIONS: Record<string, { logo: string; color: string; status: string; hint: string }> = {
  rapsodo_pitching:  { logo: "📊", color: "text-blue-500",   status: "LIVE",         hint: "Export from Rapsodo app → Sessions → Export CSV" },
  rapsodo_hitting:   { logo: "📊", color: "text-blue-500",   status: "LIVE",         hint: "Export from Rapsodo Hitting app → My Sessions → Export" },
  blast_motion:      { logo: "💥", color: "text-amber-500",  status: "LIVE",         hint: "Blast Connect app → History → Export → CSV" },
  hittrax:           { logo: "⚾", color: "text-green-500",  status: "LIVE",         hint: "HitTrax StatsCenter → Session Report → Export CSV" },
  trackman:          { logo: "📡", color: "text-red-500",    status: "API READY",    hint: "TrackMan Baseball → Coach App → Export Session" },
  diamond_kinetics:  { logo: "💎", color: "text-purple-500", status: "CSV",          hint: "Diamond Kinetics app → Sessions → Share → CSV" },
  pocket_radar:      { logo: "📻", color: "text-cyan-500",   status: "CSV / MANUAL", hint: "Pocket Radar Smart Coach → Export readings as CSV" },
  manual:            { logo: "✏️",  color: "text-muted-foreground", status: "MANUAL",hint: "Enter readings directly or paste formatted data" },
};

const STATUS_COLORS: Record<string, string> = {
  "LIVE":         "bg-green-500/10 text-green-600 border-green-500/20",
  "API READY":    "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "CSV":          "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "CSV / MANUAL": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "MANUAL":       "bg-secondary text-muted-foreground border-border",
};

const DeviceIngestionPage = () => {
  const navigate = useNavigate();
  const { registry, syncLogs, loading, quickManualEntry } = useDeviceIngestion();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedDevice, setSelectedDevice] = useState<string>("manual");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  // CSV state
  const [csvText, setCsvText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsePreview, setParsePreview] = useState<ParsedRow[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; failed: number } | null>(null);

  const deviceKey = selectedDevice as DataSource;
  const presets = SOURCE_KPI_PRESETS[selectedDevice] || SOURCE_KPI_PRESETS["manual"] || [];
  const activePreset = presets.find(p => p.name === selectedPreset);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      handleParseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleParseCSV = (text?: string) => {
    const csvToUse = text ?? csvText;
    if (!csvToUse.trim()) return;
    setParsing(true);
    setParsePreview(null);
    setParseErrors([]);
    setImportResult(null);

    setTimeout(() => {
      const result = parseDeviceCSV(csvToUse, selectedDevice !== "manual" ? selectedDevice : undefined);
      setParsePreview(result.rows);
      setParseErrors(result.errors);
      setParsing(false);

      if (result.deviceDetected && result.deviceDetected !== selectedDevice) {
        toast.info(`Auto-detected device: ${SOURCE_LABELS[result.deviceDetected as DataSource] || result.deviceDetected}`);
        setSelectedDevice(result.deviceDetected);
      }
    }, 100);
  };

  const handleImport = async () => {
    if (!parsePreview?.length) return;
    setImporting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Not logged in"); return; }

      const records = parsePreview.map(row => ({
        user_id: user.id,
        kpi_name: row.kpi_name,
        kpi_category: row.kpi_category,
        kpi_value: row.kpi_value,
        kpi_unit: row.kpi_unit,
        source: row.source,
        recorded_at: row.recorded_at || new Date().toISOString(),
        notes: row.notes || null,
      }));

      const { error } = await supabase.from("athlete_kpis" as any).insert(records);
      if (error) throw error;

      setImportResult({ imported: records.length, failed: 0 });
      setParsePreview(null);
      setCsvText("");
      toast.success(`Imported ${records.length} records from ${SOURCE_LABELS[deviceKey] || selectedDevice}`);
    } catch (err: any) {
      setImportResult({ imported: 0, failed: parsePreview.length });
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleQuickEntry = async () => {
    if (!activePreset || !value) return;
    setSaving(true);
    try {
      await quickManualEntry(activePreset.name, activePreset.category, parseFloat(value), activePreset.unit, deviceKey);
      setValue("");
      toast.success(`${activePreset.name}: ${value} ${activePreset.unit} saved`);
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = () => {
    const csv = generateCSVTemplate(selectedDevice);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vault_${selectedDevice}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6 pt-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl font-display text-foreground mb-1">DATA INGESTION</h1>
              <p className="text-muted-foreground text-sm">Import from your training devices or enter readings manually</p>
            </div>

            {/* Device Selector */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-display text-foreground mb-4">Select Your Device</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(DEVICE_DESCRIPTIONS).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedDevice(key); setParsePreview(null); setParseErrors([]); setImportResult(null); }}
                    className={`rounded-xl p-3 border text-left transition-all ${selectedDevice === key ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"}`}
                  >
                    <div className="text-xl mb-1">{info.logo}</div>
                    <p className={`text-xs font-medium ${selectedDevice === key ? "text-foreground" : "text-muted-foreground"}`}>
                      {SOURCE_LABELS[key as DataSource] || key}
                    </p>
                    <Badge className={`text-[10px] mt-1 ${STATUS_COLORS[info.status]}`}>{info.status}</Badge>
                  </button>
                ))}
              </div>
              {DEVICE_DESCRIPTIONS[selectedDevice] && (
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                  <Info className="w-3 h-3 shrink-0" />
                  {DEVICE_DESCRIPTIONS[selectedDevice].hint}
                </p>
              )}
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue={selectedDevice === "manual" ? "manual" : "csv"}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="csv">CSV Import</TabsTrigger>
                <TabsTrigger value="manual">Quick Manual Entry</TabsTrigger>
              </TabsList>

              {/* CSV IMPORT */}
              <TabsContent value="csv" className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-foreground">CSV Import</h3>
                    <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5 text-xs h-8">
                      <Download className="w-3 h-3" /> Template
                    </Button>
                  </div>

                  {/* Upload Zone */}
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) { const reader = new FileReader(); reader.onload = (ev) => { const t = ev.target?.result as string; setCsvText(t); handleParseCSV(t); }; reader.readAsText(file); }
                    }}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Drop CSV file here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports {SOURCE_LABELS[deviceKey] || "all device"} export format</p>
                    <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                  </div>

                  {/* OR paste text */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Or paste CSV data directly</Label>
                    <Textarea
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      placeholder="Paste CSV data here..."
                      className="font-mono text-xs h-28 resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleParseCSV()} disabled={!csvText.trim() || parsing} className="flex-1">
                      {parsing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                      Parse & Preview
                    </Button>
                    {csvText && <Button variant="outline" size="icon" onClick={() => { setCsvText(""); setParsePreview(null); setParseErrors([]); }}><X className="w-4 h-4" /></Button>}
                  </div>
                </div>

                {/* Parse errors */}
                {parseErrors.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-1">
                    {parseErrors.map((e, i) => (
                      <p key={i} className="text-xs text-red-600 flex items-start gap-2"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />{e}</p>
                    ))}
                  </div>
                )}

                {/* Preview table */}
                {parsePreview && parsePreview.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-foreground">
                        Preview — {parsePreview.length} records
                      </h3>
                      <Button onClick={handleImport} disabled={importing} variant="vault" size="sm">
                        {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                        Import All
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="border-b border-border"><th className="text-left py-2 pr-4 text-muted-foreground font-medium">KPI</th><th className="text-left py-2 pr-4 text-muted-foreground font-medium">Value</th><th className="text-left py-2 pr-4 text-muted-foreground font-medium">Category</th><th className="text-left py-2 text-muted-foreground font-medium">Date</th></tr></thead>
                        <tbody>
                          {parsePreview.slice(0, 20).map((row, i) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-1.5 pr-4 text-foreground">{row.kpi_name}</td>
                              <td className="py-1.5 pr-4 font-medium text-foreground">{row.kpi_value} <span className="text-muted-foreground">{row.kpi_unit}</span></td>
                              <td className="py-1.5 pr-4"><Badge variant="outline" className="text-[10px]">{row.kpi_category}</Badge></td>
                              <td className="py-1.5 text-muted-foreground">{row.recorded_at ? new Date(row.recorded_at).toLocaleDateString() : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsePreview.length > 20 && <p className="text-xs text-muted-foreground mt-2">…and {parsePreview.length - 20} more rows</p>}
                    </div>
                  </div>
                )}

                {importResult && (
                  <div className={`rounded-xl p-4 flex items-center gap-3 ${importResult.imported > 0 ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                    {importResult.imported > 0 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">{importResult.imported > 0 ? `${importResult.imported} records imported successfully` : "Import failed"}</p>
                      {importResult.failed > 0 && <p className="text-xs text-muted-foreground">{importResult.failed} rows could not be imported</p>}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* MANUAL ENTRY */}
              <TabsContent value="manual">
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                  <h3 className="font-display text-foreground">Quick Entry</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Metric</Label>
                      <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                        <SelectTrigger><SelectValue placeholder="Select metric…" /></SelectTrigger>
                        <SelectContent>
                          {presets.map(p => (
                            <SelectItem key={p.name} value={p.name}>{p.name} ({p.unit})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Value {activePreset ? `(${activePreset.unit})` : ""}</Label>
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="e.g. 87.4"
                        onKeyDown={(e) => e.key === "Enter" && handleQuickEntry()}
                        className="text-lg font-display"
                      />
                    </div>
                    <Button onClick={handleQuickEntry} disabled={!activePreset || !value || saving} variant="vault" className="h-12">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      Save Reading
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Sync Logs */}
            {syncLogs.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-display text-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Recent Imports</h3>
                <div className="space-y-2">
                  {syncLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center gap-3 text-sm">
                      <Badge className={log.sync_status === "success" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}>
                        {log.sync_status}
                      </Badge>
                      <span className="text-foreground">{SOURCE_LABELS[log.device_type as DataSource] || log.device_type}</span>
                      <span className="text-muted-foreground">{log.records_imported} records</span>
                      <span className="text-muted-foreground ml-auto text-xs">{new Date(log.started_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeviceIngestionPage;
