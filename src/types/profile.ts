import { SportType } from "@/lib/sportTypes";

export type PrivacyLevel = 'public' | 'coaches_only' | 'private';

export interface Profile {
  user_id: string;
  display_name: string | null;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
  bio?: string | null;
  position?: string | null;
  graduation_year?: number | null;
  target_schools?: string[] | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  height_inches?: number | null;
  weight_lbs?: number | null;
  throwing_arm?: string | null;
  batting_side?: string | null;
  sixty_yard_dash?: number | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  hudl_url?: string | null;
  bio_privacy?: PrivacyLevel | string;
  contact_privacy?: PrivacyLevel | string;
  physical_stats_privacy?: PrivacyLevel | string;
  sport_type?: SportType;
}
