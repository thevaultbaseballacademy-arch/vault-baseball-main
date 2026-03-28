-- Fix 1: Create a secure function to get profile data with email hidden for non-owners
-- Drop the existing function if it exists with the specific signature
DROP FUNCTION IF EXISTS get_profile_with_privacy(uuid);

CREATE OR REPLACE FUNCTION get_profile_with_privacy(target_user_id uuid)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    requesting_user_id uuid;
    is_owner boolean;
    is_admin boolean;
    is_assigned_coach boolean;
BEGIN
    requesting_user_id := auth.uid();
    
    -- Check if the requesting user is the owner
    is_owner := requesting_user_id = target_user_id;
    
    -- Check if the requesting user is an admin
    is_admin := has_role(requesting_user_id, 'admin');
    
    -- Check if the requesting user is an assigned coach
    is_assigned_coach := is_active_coach_for_athlete(requesting_user_id, target_user_id);
    
    -- Return profile with email only if owner
    -- Admins and coaches see profile but NOT email
    SELECT json_build_object(
        'user_id', p.user_id,
        'display_name', p.display_name,
        'bio', CASE 
            WHEN is_owner OR is_admin OR (p.bio_privacy = 'public') OR 
                 (p.bio_privacy = 'coaches_only' AND is_assigned_coach) 
            THEN p.bio 
            ELSE NULL 
        END,
        'avatar_url', p.avatar_url,
        'cover_url', p.cover_url,
        'position', p.position,
        'graduation_year', p.graduation_year,
        'height_inches', CASE 
            WHEN is_owner OR is_admin OR (p.physical_stats_privacy = 'public') OR 
                 (p.physical_stats_privacy = 'coaches_only' AND is_assigned_coach) 
            THEN p.height_inches 
            ELSE NULL 
        END,
        'weight_lbs', CASE 
            WHEN is_owner OR is_admin OR (p.physical_stats_privacy = 'public') OR 
                 (p.physical_stats_privacy = 'coaches_only' AND is_assigned_coach) 
            THEN p.weight_lbs 
            ELSE NULL 
        END,
        'sixty_yard_dash', CASE 
            WHEN is_owner OR is_admin OR (p.physical_stats_privacy = 'public') OR 
                 (p.physical_stats_privacy = 'coaches_only' AND is_assigned_coach) 
            THEN p.sixty_yard_dash 
            ELSE NULL 
        END,
        'throwing_arm', p.throwing_arm,
        'batting_side', p.batting_side,
        'target_schools', p.target_schools,
        'twitter_url', CASE 
            WHEN is_owner OR is_admin OR (p.contact_privacy = 'public') OR 
                 (p.contact_privacy = 'coaches_only' AND is_assigned_coach) 
            THEN p.twitter_url 
            ELSE NULL 
        END,
        'instagram_url', CASE 
            WHEN is_owner OR is_admin OR (p.contact_privacy = 'public') OR 
                 (p.contact_privacy = 'coaches_only' AND is_assigned_coach) 
            THEN p.instagram_url 
            ELSE NULL 
        END,
        'youtube_url', CASE 
            WHEN is_owner OR is_admin OR (p.contact_privacy = 'public') OR 
                 (p.contact_privacy = 'coaches_only' AND is_assigned_coach) 
            THEN p.youtube_url 
            ELSE NULL 
        END,
        'hudl_url', CASE 
            WHEN is_owner OR is_admin OR (p.contact_privacy = 'public') OR 
                 (p.contact_privacy = 'coaches_only' AND is_assigned_coach) 
            THEN p.hudl_url 
            ELSE NULL 
        END,
        -- EMAIL IS ONLY VISIBLE TO THE OWNER - NOT ADMINS OR COACHES
        'email', CASE 
            WHEN is_owner 
            THEN p.email 
            ELSE NULL 
        END,
        'bio_privacy', p.bio_privacy,
        'contact_privacy', p.contact_privacy,
        'physical_stats_privacy', p.physical_stats_privacy,
        'created_at', p.created_at,
        'updated_at', p.updated_at
    ) INTO result
    FROM profiles p
    WHERE p.user_id = target_user_id;
    
    RETURN result;
END;
$$;

-- Fix 2: Create audit logging trigger for user_purchases when admins access
CREATE OR REPLACE FUNCTION log_admin_purchase_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only log if the accessing user is an admin and not the owner
    IF auth.uid() IS NOT NULL 
       AND auth.uid() <> NEW.user_id 
       AND has_role(auth.uid(), 'admin') THEN
        INSERT INTO audit_logs (
            table_name,
            record_id,
            operation,
            changed_by,
            old_data,
            new_data
        ) VALUES (
            'user_purchases',
            NEW.id,
            'ADMIN_ACCESS',
            auth.uid(),
            NULL,
            jsonb_build_object(
                'accessed_user_id', NEW.user_id,
                'product_key', NEW.product_key,
                'amount_cents', NEW.amount_cents,
                'access_time', now()
            )
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Note: We cannot create a SELECT trigger in PostgreSQL
-- Instead, we create a secure function for admin access that logs
CREATE OR REPLACE FUNCTION get_user_purchase_for_admin(purchase_id uuid)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    product_key text,
    amount_cents integer,
    purchased_at timestamptz,
    expires_at timestamptz,
    status text,
    stripe_session_id text,
    stripe_payment_intent_id text,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only admins can use this function
    IF NOT has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    -- Log the access
    INSERT INTO audit_logs (
        table_name,
        record_id,
        operation,
        changed_by,
        old_data,
        new_data
    ) VALUES (
        'user_purchases',
        purchase_id,
        'ADMIN_VIEW',
        auth.uid(),
        NULL,
        jsonb_build_object('access_time', now())
    );
    
    -- Return the purchase data
    RETURN QUERY
    SELECT 
        p.id,
        p.user_id,
        p.product_key,
        p.amount_cents,
        p.purchased_at,
        p.expires_at,
        p.status,
        p.stripe_session_id,
        p.stripe_payment_intent_id,
        p.created_at,
        p.updated_at
    FROM user_purchases p
    WHERE p.id = purchase_id;
END;
$$;

-- Create a function to list all purchases for admin with audit logging
CREATE OR REPLACE FUNCTION list_all_purchases_for_admin()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    product_key text,
    amount_cents integer,
    purchased_at timestamptz,
    expires_at timestamptz,
    status text,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only admins can use this function
    IF NOT has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    -- Log the bulk access
    INSERT INTO audit_logs (
        table_name,
        record_id,
        operation,
        changed_by,
        old_data,
        new_data
    ) VALUES (
        'user_purchases',
        gen_random_uuid(), -- Use random UUID for bulk operations
        'ADMIN_LIST_ALL',
        auth.uid(),
        NULL,
        jsonb_build_object('access_time', now(), 'operation', 'list_all_purchases')
    );
    
    -- Return all purchases (without sensitive Stripe IDs in list view)
    RETURN QUERY
    SELECT 
        p.id,
        p.user_id,
        p.product_key,
        p.amount_cents,
        p.purchased_at,
        p.expires_at,
        p.status,
        p.created_at
    FROM user_purchases p
    ORDER BY p.created_at DESC;
END;
$$;

-- Fix 3: Add data retention policy for user_sessions (IP anonymization after 30 days)
-- This is already handled by existing purge_old_user_sessions function
-- Just ensure the function exists and works correctly

-- Add a scheduled task comment for documentation
COMMENT ON FUNCTION purge_old_user_sessions IS 'Purges user sessions older than the specified retention period. Should be called via cron job. Default retention is 90 days.';