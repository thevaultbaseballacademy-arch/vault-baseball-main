import { useState, useEffect, useRef } from "react";
import { Search, X, BookOpen, Video, Target, Users, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { courseContent, Lesson, Module } from "@/lib/courseData";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "course" | "lesson" | "drill" | "athlete" | "schedule";
  icon: React.ElementType;
  href: string;
  category?: string;
}

// Flatten course content for searching
const getStaticContent = (): SearchResult[] => {
  const results: SearchResult[] = [];
  
  Object.entries(courseContent).forEach(([courseId, course]) => {
    results.push({
      id: courseId,
      title: courseId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: `Full course with ${course.modules.length} modules`,
      type: "course",
      icon: BookOpen,
      href: `/course/${courseId}`,
      category: "Courses"
    });

    course.modules.forEach((module: Module) => {
      module.lessons.forEach((lesson: Lesson) => {
        results.push({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: "lesson",
          icon: Video,
          href: `/course/${courseId}?lesson=${lesson.id}`,
          category: module.title
        });
      });
    });
  });

  const staticDrills: SearchResult[] = [
    { id: "velocity-drill", title: "Long Toss Protocol", description: "Build arm strength and velocity", type: "drill", icon: Target, href: "/course/velocity-system", category: "Velocity" },
    { id: "plyo-drill", title: "Plyo Ball Routines", description: "Weighted ball training drills", type: "drill", icon: Target, href: "/course/velocity-system", category: "Velocity" },
    { id: "arm-care", title: "Arm Care Routine", description: "Daily arm health exercises", type: "drill", icon: Target, href: "/course/arm-health-workload", category: "Arm Health" },
    { id: "hip-sep", title: "Hip-Shoulder Separation", description: "Rotational mechanics drill", type: "drill", icon: Target, href: "/course/velocity-system", category: "Mechanics" },
    { id: "lead-leg", title: "Lead Leg Block Drill", description: "Energy transfer training", type: "drill", icon: Target, href: "/course/velocity-system", category: "Mechanics" },
    { id: "sprint-mech", title: "Sprint Mechanics", description: "Base running speed drills", type: "drill", icon: Target, href: "/course/speed-agility", category: "Speed" },
    { id: "lateral-move", title: "Lateral Movement", description: "Infield agility drills", type: "drill", icon: Target, href: "/course/speed-agility", category: "Agility" },
    { id: "med-ball", title: "Medicine Ball Training", description: "Rotational power development", type: "drill", icon: Target, href: "/course/strength-power-system", category: "Strength" },
    { id: "outfield-util", title: "Outfield Utility Drills", description: "Routes, jumps, and arm strength", type: "drill", icon: Target, href: "/course/speed-agility", category: "Outfield" },
  ];

  return [...results, ...staticDrills];
};

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const staticContent = getStaticContent();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();

    // Filter static content
    const staticResults = staticContent.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.category?.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    // Search athletes from database
    const searchAthletes = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('user_id, display_name, position')
          .ilike('display_name', `%${query}%`)
          .limit(5);

        const athleteResults: SearchResult[] = (data || []).map(a => ({
          id: a.user_id,
          title: a.display_name || 'Unknown Athlete',
          description: a.position || 'Athlete',
          type: "athlete" as const,
          icon: Users,
          href: `/profile/${a.user_id}`,
          category: "Athletes"
        }));

        setResults([...athleteResults, ...staticResults].slice(0, 8));
      } catch {
        setResults(staticResults);
      }
    };

    searchAthletes();
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery("");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (result: SearchResult) => {
    navigate(result.href);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 px-4 py-2.5 bg-secondary border border-border rounded-xl text-muted-foreground hover:border-accent/50 hover:text-foreground transition-all w-full md:w-80"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left text-sm">Search drills, courses...</span>
        <kbd className="hidden md:inline-flex px-2 py-0.5 text-xs bg-muted rounded border border-border">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
            >
              <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyNavigation}
                    placeholder="Search drills, courses, lessons..."
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
                    autoFocus
                  />
                  {query && (
                    <button onClick={() => setQuery("")}>
                      <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                  {query.length < 2 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <p>Type at least 2 characters to search</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="px-3 py-1 bg-secondary rounded-full text-sm">Try: "velocity"</span>
                        <span className="px-3 py-1 bg-secondary rounded-full text-sm">Try: "outfield"</span>
                        <span className="px-3 py-1 bg-secondary rounded-full text-sm">Try: "arm care"</span>
                      </div>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No results found for "{query}"
                    </div>
                  ) : (
                    <div className="py-2">
                      {results.map((result, index) => (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          className={`w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-secondary/50 transition-colors ${
                            index === selectedIndex ? 'bg-secondary' : ''
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <result.icon className="w-5 h-5 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{result.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                          </div>
                          {result.category && (
                            <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground flex-shrink-0">
                              {result.category}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border bg-secondary/30 flex items-center justify-between text-xs text-muted-foreground">
                  <span>↑↓ to navigate</span>
                  <span>↵ to select</span>
                  <span>esc to close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalSearch;
