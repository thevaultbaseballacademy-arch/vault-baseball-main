import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Profile {
  user_id: string;
  display_name: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const MentionInput = ({ value, onChange, placeholder, className, minHeight = "100px" }: MentionInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async (search: string) => {
    if (!search) {
      setSuggestions([]);
      return;
    }

    try {
      // Use secure RPC function for searching public profiles
      const { data, error } = await supabase
        .rpc('search_public_profiles', { search_term: search, result_limit: 5 });

      if (error) throw error;
      
      // Map the response to match our Profile interface
      const profiles: Profile[] = (data || []).map((p: { user_id: string; display_name: string; player_position: string; }) => ({
        user_id: p.user_id,
        display_name: p.display_name
      }));
      
      setSuggestions(profiles);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (mentionSearch) {
      const debounce = setTimeout(() => fetchUsers(mentionSearch), 200);
      return () => clearTimeout(debounce);
    } else {
      setSuggestions([]);
    }
  }, [mentionSearch, fetchUsers]);

  const getMentionContext = (text: string, position: number) => {
    const textBeforeCursor = text.slice(0, position);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) return null;
    
    const textBetween = textBeforeCursor.slice(lastAtIndex + 1);
    
    // Check if there's a space or newline after @ (mention completed or cancelled)
    if (textBetween.includes(' ') || textBetween.includes('\n')) return null;
    
    // Check if @ is at start or preceded by space/newline
    if (lastAtIndex > 0 && !/[\s\n]/.test(text[lastAtIndex - 1])) return null;
    
    return {
      start: lastAtIndex,
      search: textBetween
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(newPosition);
    
    const context = getMentionContext(newValue, newPosition);
    
    if (context) {
      setMentionSearch(context.search);
      setShowSuggestions(true);
    } else {
      setMentionSearch("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && showSuggestions) {
      e.preventDefault();
      insertMention(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const insertMention = (profile: Profile) => {
    const context = getMentionContext(value, cursorPosition);
    if (!context) return;

    const beforeMention = value.slice(0, context.start);
    const afterMention = value.slice(cursorPosition);
    const mention = `@${profile.display_name} `;
    
    const newValue = beforeMention + mention + afterMention;
    onChange(newValue);
    
    setShowSuggestions(false);
    setMentionSearch("");
    
    // Focus and set cursor position after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = context.start + mention.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("resize-none border-border bg-background", className)}
        style={{ minHeight }}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
        >
          {suggestions.map((profile, index) => (
            <button
              key={profile.user_id}
              onClick={() => insertMention(profile)}
              className={cn(
                "w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-muted transition-colors",
                index === selectedIndex && "bg-muted"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-xs">
                  {profile.display_name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <span className="text-sm text-foreground truncate">
                {profile.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionInput;