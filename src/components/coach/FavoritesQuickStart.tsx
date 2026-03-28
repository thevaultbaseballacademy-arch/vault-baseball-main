import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Plus, X, Play, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FavoriteItem {
  id: string;
  title: string;
  type: "course" | "drill" | "lesson";
  href: string;
  color: string;
}

const defaultFavorites: FavoriteItem[] = [
  { id: "fav-1", title: "Arm Care Routine", type: "drill", href: "/course/arm-health-workload", color: "#22c55e" },
  { id: "fav-2", title: "Long Toss Protocol", type: "drill", href: "/course/velocity-system", color: "#3b82f6" },
  { id: "fav-3", title: "Plyo Ball Drills", type: "drill", href: "/course/velocity-system", color: "#8b5cf6" },
];

const availableDrills: FavoriteItem[] = [
  { id: "drill-1", title: "Arm Care Routine", type: "drill", href: "/course/arm-health-workload", color: "#22c55e" },
  { id: "drill-2", title: "Long Toss Protocol", type: "drill", href: "/course/velocity-system", color: "#3b82f6" },
  { id: "drill-3", title: "Plyo Ball Drills", type: "drill", href: "/course/velocity-system", color: "#8b5cf6" },
  { id: "drill-4", title: "Hip-Shoulder Separation", type: "drill", href: "/course/velocity-system", color: "#f59e0b" },
  { id: "drill-5", title: "Lead Leg Block", type: "drill", href: "/course/velocity-system", color: "#ef4444" },
  { id: "drill-6", title: "Sprint Mechanics", type: "drill", href: "/course/speed-agility", color: "#06b6d4" },
  { id: "drill-7", title: "Lateral Movement", type: "drill", href: "/course/speed-agility", color: "#ec4899" },
  { id: "drill-8", title: "Medicine Ball Training", type: "drill", href: "/course/strength-power-system", color: "#f97316" },
  { id: "drill-9", title: "Outfield Routes", type: "drill", href: "/course/speed-agility", color: "#14b8a6" },
  { id: "drill-10", title: "Infield Footwork", type: "drill", href: "/course/speed-agility", color: "#a855f7" },
];

const FavoritesQuickStart = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("coach-favorites");
    if (stored) {
      setFavorites(JSON.parse(stored));
    } else {
      setFavorites(defaultFavorites);
    }
  }, []);

  const saveFavorites = (items: FavoriteItem[]) => {
    localStorage.setItem("coach-favorites", JSON.stringify(items));
    setFavorites(items);
  };

  const removeFavorite = (id: string) => {
    saveFavorites(favorites.filter(f => f.id !== id));
  };

  const addFavorite = (item: FavoriteItem) => {
    if (!favorites.find(f => f.id === item.id)) {
      saveFavorites([...favorites, item]);
    }
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-accent fill-accent" />
          <h2 className="font-display text-xl text-foreground">QUICK START</h2>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Quick Start</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 mt-4 max-h-80 overflow-y-auto">
              {availableDrills.filter(d => !favorites.find(f => f.id === d.id)).map((drill) => (
                <button
                  key={drill.id}
                  onClick={() => addFavorite(drill)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${drill.color}20` }}
                  >
                    <Play className="w-4 h-4" style={{ color: drill.color }} />
                  </div>
                  <span className="text-foreground">{drill.title}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {favorites.length === 0 ? (
          <div className="col-span-3 p-8 bg-card border border-dashed border-border rounded-2xl text-center">
            <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No favorites yet</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add your first
            </Button>
          </div>
        ) : (
          favorites.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <button
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-accent/50 hover:shadow-md transition-all"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Play className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(item.id);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default FavoritesQuickStart;
