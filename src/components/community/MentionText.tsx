import { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface MentionTextProps {
  content: string;
}

interface ProfileMatch {
  display_name: string;
  user_id: string;
}

const MentionText = ({ content }: MentionTextProps) => {
  const [profileMap, setProfileMap] = useState<Map<string, string>>(new Map());
  
  // Extract all mentions from content
  const mentionRegex = /@(\w+(?:\s\w+)?)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  useEffect(() => {
    const fetchProfiles = async () => {
      if (mentions.length === 0) return;

      // Use secure RPC function to search for each mentioned name
      const map = new Map<string, string>();
      
      for (const mentionName of mentions) {
        const { data } = await supabase
          .rpc('search_public_profiles', { search_term: mentionName, result_limit: 1 });
        
        if (data && data.length > 0) {
          const profile = data[0] as { user_id: string; display_name: string };
          if (profile.display_name && profile.display_name.toLowerCase() === mentionName.toLowerCase()) {
            map.set(mentionName.toLowerCase(), profile.user_id);
          }
        }
      }
      
      setProfileMap(map);
    };

    fetchProfiles();
  }, [content]);

  // Parse and render content with clickable mentions
  const parts = content.split(/(@\w+(?:\s\w+)?)/g);
  
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          const mentionName = part.slice(1);
          const userId = profileMap.get(mentionName.toLowerCase());
          
          if (userId) {
            return (
              <Link
                key={index}
                to={`/profile/${userId}`}
                className="text-primary font-medium hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </Link>
            );
          }
          
          return (
            <span
              key={index}
              className="text-primary font-medium"
            >
              {part}
            </span>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </span>
  );
};

export default MentionText;