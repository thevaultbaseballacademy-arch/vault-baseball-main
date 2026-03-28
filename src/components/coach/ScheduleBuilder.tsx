import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { positions, phases, type Position, type TrainingPhase, type DaySchedule, type TrainingBlock, type Emphasis, type Intensity } from "@/lib/calendarSchedules";

interface ScheduleBuilderProps {
  initialName?: string;
  initialDescription?: string;
  initialPosition?: Position;
  initialPhase?: TrainingPhase;
  initialSchedule?: DaySchedule[];
  onSave: (data: {
    name: string;
    description: string;
    position: Position;
    phase: TrainingPhase;
    schedule: DaySchedule[];
  }) => void;
  onCancel: () => void;
  saving?: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const EMPHASIS_OPTIONS: { value: Emphasis; label: string; color: string }[] = [
  { value: "velocity", label: "Velocity", color: "bg-red-500" },
  { value: "athleticism", label: "Athleticism", color: "bg-blue-500" },
  { value: "skill", label: "Skill/Transfer", color: "bg-green-500" },
  { value: "recovery", label: "Recovery", color: "bg-purple-500" },
  { value: "mental", label: "Mental", color: "bg-yellow-500" },
];
const INTENSITY_OPTIONS: { value: Intensity; label: string }[] = [
  { value: "high", label: "High" },
  { value: "moderate", label: "Moderate" },
  { value: "low", label: "Low" },
];
const PRIMARY_OPTIONS = ["velocity", "athleticism", "skill", "recovery"] as const;

const createEmptySchedule = (): DaySchedule[] => {
  return DAYS.map((day, i) => ({
    day,
    shortDay: SHORT_DAYS[i],
    primary: "skill" as const,
    theme: "",
    blocks: [],
  }));
};

export function ScheduleBuilder({
  initialName = "",
  initialDescription = "",
  initialPosition = "utility",
  initialPhase = "off-season",
  initialSchedule,
  onSave,
  onCancel,
  saving = false,
}: ScheduleBuilderProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [position, setPosition] = useState<Position>(initialPosition);
  const [phase, setPhase] = useState<TrainingPhase>(initialPhase);
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule || createEmptySchedule());
  const [selectedDay, setSelectedDay] = useState(0);

  const currentDay = schedule[selectedDay];

  const updateDay = (updates: Partial<DaySchedule>) => {
    setSchedule(prev => prev.map((d, i) => i === selectedDay ? { ...d, ...updates } : d));
  };

  const addBlock = () => {
    const newBlock: TrainingBlock = {
      id: `block-${Date.now()}`,
      name: "New Block",
      duration: "30 min",
      emphasis: "skill",
      description: "",
      intensity: "moderate",
    };
    updateDay({ blocks: [...currentDay.blocks, newBlock] });
  };

  const updateBlock = (blockIndex: number, updates: Partial<TrainingBlock>) => {
    const newBlocks = currentDay.blocks.map((b, i) => i === blockIndex ? { ...b, ...updates } : b);
    updateDay({ blocks: newBlocks });
  };

  const removeBlock = (blockIndex: number) => {
    updateDay({ blocks: currentDay.blocks.filter((_, i) => i !== blockIndex) });
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name, description, position, phase, schedule });
  };

  return (
    <div className="space-y-6">
      {/* Schedule Meta */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Schedule Name *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Off-Season Pitcher Program"
            className="bg-secondary"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="bg-secondary"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Position</label>
          <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
            <SelectTrigger className="bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {positions.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Training Phase</label>
          <Select value={phase} onValueChange={(v) => setPhase(v as TrainingPhase)}>
            <SelectTrigger className="bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {phases.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {schedule.map((day, i) => (
          <button
            key={day.day}
            onClick={() => setSelectedDay(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedDay === i
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {day.shortDay}
            {day.blocks.length > 0 && (
              <span className="ml-1 text-xs opacity-60">({day.blocks.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Day Editor */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-foreground">{currentDay.day}</h3>
          <div className="flex items-center gap-3">
            <Select
              value={currentDay.primary}
              onValueChange={(v) => updateDay({ primary: v as typeof PRIMARY_OPTIONS[number] })}
            >
              <SelectTrigger className="w-36 bg-secondary">
                <SelectValue placeholder="Primary" />
              </SelectTrigger>
              <SelectContent>
                {PRIMARY_OPTIONS.map(p => (
                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-1 block">Day Theme</label>
          <Input
            value={currentDay.theme}
            onChange={(e) => updateDay({ theme: e.target.value })}
            placeholder="e.g., Max Intent Day"
            className="bg-secondary"
          />
        </div>

        {/* Blocks */}
        <div className="space-y-3">
          {currentDay.blocks.map((block, blockIndex) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary rounded-lg p-3 border border-border"
            >
              <div className="flex items-start gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground mt-2 cursor-grab" />
                <div className="flex-1 grid md:grid-cols-4 gap-3">
                  <Input
                    value={block.name}
                    onChange={(e) => updateBlock(blockIndex, { name: e.target.value })}
                    placeholder="Block name"
                    className="bg-background"
                  />
                  <Input
                    value={block.duration}
                    onChange={(e) => updateBlock(blockIndex, { duration: e.target.value })}
                    placeholder="Duration"
                    className="bg-background"
                  />
                  <Select
                    value={block.emphasis}
                    onValueChange={(v) => updateBlock(blockIndex, { emphasis: v as Emphasis })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPHASIS_OPTIONS.map(e => (
                        <SelectItem key={e.value} value={e.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${e.color}`} />
                            {e.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={block.intensity}
                    onValueChange={(v) => updateBlock(blockIndex, { intensity: v as Intensity })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTENSITY_OPTIONS.map(i => (
                        <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBlock(blockIndex)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-2 ml-7">
                <Textarea
                  value={block.description}
                  onChange={(e) => updateBlock(blockIndex, { description: e.target.value })}
                  placeholder="Block description..."
                  className="bg-background min-h-[60px]"
                />
              </div>
            </motion.div>
          ))}

          <Button variant="outline" onClick={addBlock} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Training Block
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button variant="vault" onClick={handleSave} disabled={!name.trim() || saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Schedule"}
        </Button>
      </div>
    </div>
  );
}
