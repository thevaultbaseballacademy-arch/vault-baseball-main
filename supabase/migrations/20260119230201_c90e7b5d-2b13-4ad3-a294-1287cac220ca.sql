-- Drop and recreate profiles_public view with security_invoker and privacy respect
DROP VIEW IF EXISTS profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
SELECT 
    id,
    user_id,
    display_name,
    position,
    avatar_url,
    cover_url,
    graduation_year,
    throwing_arm,
    batting_side,
    created_at,
    updated_at,
    -- Bio only shown if bio_privacy is 'public' or viewer is owner/admin
    CASE 
        WHEN auth.uid() = user_id THEN bio
        WHEN has_role(auth.uid(), 'admin'::app_role) THEN bio
        WHEN bio_privacy = 'public' THEN bio
        ELSE NULL
    END AS bio,
    -- Physical stats only shown if physical_stats_privacy is 'public' or viewer is owner/admin
    CASE 
        WHEN auth.uid() = user_id THEN height_inches
        WHEN has_role(auth.uid(), 'admin'::app_role) THEN height_inches
        WHEN physical_stats_privacy = 'public' THEN height_inches
        ELSE NULL
    END AS height_inches,
    CASE 
        WHEN auth.uid() = user_id THEN weight_lbs
        WHEN has_role(auth.uid(), 'admin'::app_role) THEN weight_lbs
        WHEN physical_stats_privacy = 'public' THEN weight_lbs
        ELSE NULL
    END AS weight_lbs,
    CASE 
        WHEN auth.uid() = user_id THEN sixty_yard_dash
        WHEN has_role(auth.uid(), 'admin'::app_role) THEN sixty_yard_dash
        WHEN physical_stats_privacy = 'public' THEN sixty_yard_dash
        ELSE NULL
    END AS sixty_yard_dash,
    -- Contact info only shown if contact_privacy is 'public' or viewer is owner/admin
    CASE 
        WHEN auth.uid() = user_id THEN email
        WHEN has_role(auth.uid(), 'admin'::app_role) THEN email
        WHEN contact_privacy = 'public' THEN email
        ELSE NULL
    END AS email,
    CASE 
        WHEN auth.uid() = user_id THEN twitter_url
        WHEN has_role(auth.uid(), 'admin'::app_role) THEN twitter_url
        WHEN contact_privacy = 'public' THEN twitter_url
        ELSE NULL
    END AS twitter_url,
    CASE 
        WHEN auth.uid() = user_id THEN instagram_url
        WHEN has_role(auth.uid(), 'admin'::app_role) THEN instagram_url
        WHEN contact_privacy = 'public' THEN instagram_url
        ELSE NULL
    END AS instagram_url,
    CASE 
        WHEN auth.uid() = user_id THEN youtube_url
        WHEN has_role(auth.uid(), 'admin'::app_role) THEN youtube_url
        WHEN contact_privacy = 'public' THEN youtube_url
        ELSE NULL
    END AS youtube_url,
    CASE 
        WHEN auth.uid() = user_id THEN hudl_url
        WHEN has_role(auth.uid(), 'admin'::app_role) THEN hudl_url
        WHEN contact_privacy = 'public' THEN hudl_url
        ELSE NULL
    END AS hudl_url,
    CASE 
        WHEN auth.uid() = user_id THEN target_schools
        WHEN has_role(auth.uid(), 'admin'::app_role) THEN target_schools
        WHEN contact_privacy = 'public' THEN target_schools
        ELSE NULL
    END AS target_schools,
    -- Include privacy settings for reference (always visible to owner)
    CASE 
        WHEN auth.uid() = user_id THEN bio_privacy
        ELSE NULL
    END AS bio_privacy,
    CASE 
        WHEN auth.uid() = user_id THEN contact_privacy
        ELSE NULL
    END AS contact_privacy,
    CASE 
        WHEN auth.uid() = user_id THEN physical_stats_privacy
        ELSE NULL
    END AS physical_stats_privacy
FROM profiles
WHERE auth.uid() IS NOT NULL;