import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useAddMetric } from "@/hooks/useDeviceMetrics";
import { DEVICE_CONFIG, type DeviceType } from "@/types/deviceMetrics";

const metricSchema = z.object({
  device_type: z.string(),
  metric_category: z.enum(['pitching', 'hitting', 'throwing']),
  recorded_at: z.string().optional(),
  pitch_type: z.string().optional(),
  velocity_mph: z.coerce.number().min(0).max(120).optional(),
  spin_rate_rpm: z.coerce.number().min(0).max(4000).optional(),
  exit_velocity_mph: z.coerce.number().min(0).max(120).optional(),
  launch_angle: z.coerce.number().min(-90).max(90).optional(),
  distance_ft: z.coerce.number().min(0).max(600).optional(),
  bat_speed_mph: z.coerce.number().min(0).max(100).optional(),
  measured_velocity_mph: z.coerce.number().min(0).max(120).optional(),
  notes: z.string().max(500).optional(),
});

type MetricFormData = z.infer<typeof metricSchema>;

interface ManualMetricEntryProps {
  userId: string;
}

export function ManualMetricEntry({ userId }: ManualMetricEntryProps) {
  const [open, setOpen] = useState(false);
  const addMetric = useAddMetric();
  
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<MetricFormData>({
    resolver: zodResolver(metricSchema),
    defaultValues: {
      recorded_at: new Date().toISOString().slice(0, 16),
    }
  });
  
  const selectedCategory = watch('metric_category');
  const selectedDevice = watch('device_type');
  
  const onSubmit = async (data: MetricFormData) => {
    await addMetric.mutateAsync({
      user_id: userId,
      device_type: data.device_type as DeviceType,
      metric_category: data.metric_category,
      recorded_at: data.recorded_at || new Date().toISOString(),
      pitch_type: data.pitch_type || null,
      velocity_mph: data.velocity_mph || null,
      spin_rate_rpm: data.spin_rate_rpm || null,
      exit_velocity_mph: data.exit_velocity_mph || null,
      launch_angle: data.launch_angle || null,
      distance_ft: data.distance_ft || null,
      bat_speed_mph: data.bat_speed_mph || null,
      measured_velocity_mph: data.measured_velocity_mph || null,
      notes: data.notes || null,
      import_source: 'manual'
    });
    
    reset();
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Metric
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wider">
            Record Metric
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Device</Label>
              <Select onValueChange={(v) => setValue('device_type', v as DeviceType)}>
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
              {errors.device_type && (
                <p className="text-xs text-destructive">{errors.device_type.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select onValueChange={(v) => setValue('metric_category', v as 'pitching' | 'hitting' | 'throwing')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pitching">Pitching</SelectItem>
                  <SelectItem value="hitting">Hitting</SelectItem>
                  <SelectItem value="throwing">Throwing</SelectItem>
                </SelectContent>
              </Select>
              {errors.metric_category && (
                <p className="text-xs text-destructive">{errors.metric_category.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <Input type="datetime-local" {...register('recorded_at')} />
          </div>
          
          {/* Pitching fields */}
          {selectedCategory === 'pitching' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <Label>Pitch Type</Label>
                <Select onValueChange={(v) => setValue('pitch_type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fastball">Fastball</SelectItem>
                    <SelectItem value="curveball">Curveball</SelectItem>
                    <SelectItem value="slider">Slider</SelectItem>
                    <SelectItem value="changeup">Changeup</SelectItem>
                    <SelectItem value="cutter">Cutter</SelectItem>
                    <SelectItem value="sinker">Sinker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Velocity (mph)</Label>
                <Input type="number" step="0.1" placeholder="85.5" {...register('velocity_mph')} />
              </div>
              <div className="space-y-2">
                <Label>Spin Rate (rpm)</Label>
                <Input type="number" placeholder="2400" {...register('spin_rate_rpm')} />
              </div>
            </motion.div>
          )}
          
          {/* Hitting fields */}
          {selectedCategory === 'hitting' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <Label>Exit Velocity (mph)</Label>
                <Input type="number" step="0.1" placeholder="95.0" {...register('exit_velocity_mph')} />
              </div>
              <div className="space-y-2">
                <Label>Launch Angle (°)</Label>
                <Input type="number" step="0.1" placeholder="25.0" {...register('launch_angle')} />
              </div>
              <div className="space-y-2">
                <Label>Distance (ft)</Label>
                <Input type="number" step="1" placeholder="380" {...register('distance_ft')} />
              </div>
              <div className="space-y-2">
                <Label>Bat Speed (mph)</Label>
                <Input type="number" step="0.1" placeholder="70.0" {...register('bat_speed_mph')} />
              </div>
            </motion.div>
          )}
          
          {/* Throwing fields */}
          {selectedCategory === 'throwing' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <Label>Velocity (mph)</Label>
              <Input type="number" step="0.1" placeholder="75.0" {...register('measured_velocity_mph')} />
            </motion.div>
          )}
          
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea 
              placeholder="Session notes, drill details, etc." 
              {...register('notes')} 
              className="resize-none"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={addMetric.isPending}>
              {addMetric.isPending ? 'Saving...' : 'Save Metric'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
