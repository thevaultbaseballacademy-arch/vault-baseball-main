import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBulkAddMetrics } from "@/hooks/useDeviceMetrics";
import { DEVICE_CONFIG, type DeviceType } from "@/types/deviceMetrics";

interface CSVUploaderProps {
  userId: string;
}

const COLUMN_MAPPINGS: Partial<Record<DeviceType, Record<string, string>>> = {
  rapsodo: {
    'Velocity': 'velocity_mph',
    'Spin Rate': 'spin_rate_rpm',
    'Spin Axis': 'spin_axis',
    'Spin Efficiency': 'spin_efficiency',
    'Horizontal Break': 'horizontal_break',
    'Vertical Break': 'vertical_break',
    'Pitch Type': 'pitch_type',
    'Exit Velocity': 'exit_velocity_mph',
    'Launch Angle': 'launch_angle',
    'Distance': 'distance_ft'
  },
  rapsodo_pitching: {
    'Velocity': 'velocity_mph',
    'Spin Rate': 'spin_rate_rpm',
    'Spin Axis': 'spin_axis',
    'Spin Efficiency': 'spin_efficiency',
    'Horizontal Break': 'horizontal_break',
    'Vertical Break': 'vertical_break',
    'Pitch Type': 'pitch_type'
  },
  rapsodo_hitting: {
    'Exit Velocity': 'exit_velocity_mph',
    'Launch Angle': 'launch_angle',
    'Distance': 'distance_ft',
    'Spin Rate': 'spin_rate_rpm'
  },
  hittrax: {
    'Exit Velo': 'exit_velocity_mph',
    'Exit Velocity': 'exit_velocity_mph',
    'LA': 'launch_angle',
    'Launch Angle': 'launch_angle',
    'Distance': 'distance_ft',
    'Dist': 'distance_ft'
  },
  blast_motion: {
    'Bat Speed': 'bat_speed_mph',
    'Attack Angle': 'attack_angle',
    'Time to Contact': 'time_to_contact',
    'On Plane': 'on_plane_efficiency',
    'Power': 'power_index',
    'Connection': 'connection_score',
    'Rotation': 'rotation_score'
  },
  trackman: {
    'Pitch Velocity': 'velocity_mph',
    'Spin Rate': 'spin_rate_rpm',
    'Exit Speed': 'exit_velocity_mph',
    'Launch Angle': 'launch_angle',
    'Distance': 'distance_ft',
    'Pitch Type': 'pitch_type'
  },
  pocket_radar: {
    'Speed': 'measured_velocity_mph',
    'Velocity': 'measured_velocity_mph',
    'Type': 'velocity_type'
  },
  diamond_kinetics: {
    'Bat Speed': 'bat_speed_mph',
    'Hand Speed': 'peak_hand_speed',
    'Attack Angle': 'attack_angle',
    'Power': 'power_index'
  },
};

export function CSVUploader({ userId }: CSVUploaderProps) {
  const [open, setOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  const [category, setCategory] = useState<'pitching' | 'hitting' | 'throwing'>('pitching');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const bulkAddMetrics = useBulkAddMetrics();
  
  const parseCSV = useCallback((text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: Record<string, string>[] = [];
    
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      rows.push(row);
    }
    
    return rows;
  }, []);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    const text = await selectedFile.text();
    const previewRows = parseCSV(text);
    setPreview(previewRows);
  };
  
  const handleImport = async () => {
    if (!file || !deviceType) return;
    
    setError(null);
    
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const mapping = COLUMN_MAPPINGS[deviceType];
      const metrics: Parameters<typeof bulkAddMetrics.mutateAsync>[0] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const metric: Record<string, unknown> = {
          user_id: userId,
          device_type: deviceType,
          metric_category: category,
          import_source: 'csv',
          recorded_at: new Date().toISOString()
        };
        
        headers.forEach((header, idx) => {
          const fieldName = mapping[header];
          if (fieldName && values[idx]) {
            const value = values[idx];
            // Convert numeric fields
            if (['velocity_mph', 'spin_rate_rpm', 'exit_velocity_mph', 'launch_angle', 
                 'distance_ft', 'bat_speed_mph', 'measured_velocity_mph', 'spin_axis',
                 'spin_efficiency', 'horizontal_break', 'vertical_break', 'attack_angle',
                 'time_to_contact', 'on_plane_efficiency', 'power_index', 'connection_score',
                 'rotation_score'].includes(fieldName)) {
              metric[fieldName] = parseFloat(value) || null;
            } else {
              metric[fieldName] = value;
            }
          }
        });
        
        metrics.push(metric as Parameters<typeof bulkAddMetrics.mutateAsync>[0][0]);
      }
      
      if (metrics.length === 0) {
        setError('No valid data found in CSV');
        return;
      }
      
      await bulkAddMetrics.mutateAsync(metrics);
      setOpen(false);
      setFile(null);
      setPreview([]);
    } catch (err) {
      setError(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wider">
            Import Metrics from CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Device Source</Label>
              <Select onValueChange={(v) => setDeviceType(v as DeviceType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEVICE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.logo} {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as 'pitching' | 'hitting' | 'throwing')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pitching">Pitching</SelectItem>
                  <SelectItem value="hitting">Hitting</SelectItem>
                  <SelectItem value="throwing">Throwing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* File upload */}
          <div className="space-y-2">
            <Label>CSV File</Label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileSpreadsheet className="w-8 h-8 mb-2 text-muted-foreground" />
                {file ? (
                  <p className="text-sm text-foreground">{file.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                )}
              </div>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          
          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview (first 5 rows)</Label>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-secondary">
                    <tr>
                      {Object.keys(preview[0]).map((header) => (
                        <th key={header} className="px-2 py-1 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-t border-border">
                        {Object.values(row).map((value, vIdx) => (
                          <td key={vIdx} className="px-2 py-1 truncate max-w-[100px]">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {deviceType && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Recognized columns: {Object.keys(COLUMN_MAPPINGS[deviceType]).join(', ')}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleImport}
              disabled={!file || !deviceType || bulkAddMetrics.isPending}
            >
              {bulkAddMetrics.isPending ? 'Importing...' : `Import ${preview.length > 0 ? 'Data' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
