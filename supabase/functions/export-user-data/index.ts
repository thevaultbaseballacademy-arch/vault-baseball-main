import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`Exporting data for user: ${userId}`);

    // Collect all user data from various tables
    const exportData: Record<string, any> = {
      export_info: {
        generated_at: new Date().toISOString(),
        user_id: userId,
        user_email: user.email,
        gdpr_compliant: true,
        data_categories: [],
      },
      account: {
        email: user.email,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
        email_confirmed: user.email_confirmed_at,
      },
    };

    // Profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (profile) {
      exportData.profile = profile;
      exportData.export_info.data_categories.push('profile');
    }

    // Athlete check-ins
    const { data: checkins } = await supabase
      .from('athlete_checkins')
      .select('*')
      .eq('user_id', userId);
    if (checkins?.length) {
      exportData.athlete_checkins = checkins;
      exportData.export_info.data_categories.push('athlete_checkins');
    }

    // Athlete KPIs
    const { data: kpis } = await supabase
      .from('athlete_kpis')
      .select('*')
      .eq('user_id', userId);
    if (kpis?.length) {
      exportData.athlete_kpis = kpis;
      exportData.export_info.data_categories.push('athlete_kpis');
    }

    // Athlete KPI Goals
    const { data: kpiGoals } = await supabase
      .from('athlete_kpi_goals')
      .select('*')
      .eq('user_id', userId);
    if (kpiGoals?.length) {
      exportData.athlete_kpi_goals = kpiGoals;
      exportData.export_info.data_categories.push('athlete_kpi_goals');
    }

    // Athletic stats
    const { data: athleticStats } = await supabase
      .from('athletic_stats')
      .select('*')
      .eq('user_id', userId);
    if (athleticStats?.length) {
      exportData.athletic_stats = athleticStats;
      exportData.export_info.data_categories.push('athletic_stats');
    }

    // Highlight videos
    const { data: videos } = await supabase
      .from('highlight_videos')
      .select('*')
      .eq('user_id', userId);
    if (videos?.length) {
      exportData.highlight_videos = videos;
      exportData.export_info.data_categories.push('highlight_videos');
    }

    // Certification attempts
    const { data: certAttempts } = await supabase
      .from('certification_attempts')
      .select('*')
      .eq('user_id', userId);
    if (certAttempts?.length) {
      exportData.certification_attempts = certAttempts;
      exportData.export_info.data_categories.push('certification_attempts');
    }

    // User certifications
    const { data: userCerts } = await supabase
      .from('user_certifications')
      .select('*')
      .eq('user_id', userId);
    if (userCerts?.length) {
      exportData.user_certifications = userCerts;
      exportData.export_info.data_categories.push('user_certifications');
    }

    // Course enrollments
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', userId);
    if (enrollments?.length) {
      exportData.course_enrollments = enrollments;
      exportData.export_info.data_categories.push('course_enrollments');
    }

    // Course progress
    const { data: courseProgress } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', userId);
    if (courseProgress?.length) {
      exportData.course_progress = courseProgress;
      exportData.export_info.data_categories.push('course_progress');
    }

    // Course certificates
    const { data: courseCerts } = await supabase
      .from('course_certificates')
      .select('*')
      .eq('user_id', userId);
    if (courseCerts?.length) {
      exportData.course_certificates = courseCerts;
      exportData.export_info.data_categories.push('course_certificates');
    }

    // Community posts
    const { data: posts } = await supabase
      .from('community_posts')
      .select('*')
      .eq('user_id', userId);
    if (posts?.length) {
      exportData.community_posts = posts;
      exportData.export_info.data_categories.push('community_posts');
    }

    // Community comments
    const { data: comments } = await supabase
      .from('community_comments')
      .select('*')
      .eq('user_id', userId);
    if (comments?.length) {
      exportData.community_comments = comments;
      exportData.export_info.data_categories.push('community_comments');
    }

    // Community likes
    const { data: likes } = await supabase
      .from('community_likes')
      .select('*')
      .eq('user_id', userId);
    if (likes?.length) {
      exportData.community_likes = likes;
      exportData.export_info.data_categories.push('community_likes');
    }

    // Coaching sessions
    const { data: sessions } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('user_id', userId);
    if (sessions?.length) {
      exportData.coaching_sessions = sessions;
      exportData.export_info.data_categories.push('coaching_sessions');
    }

    // Coach-athlete assignments (as athlete)
    const { data: coachAssignments } = await supabase
      .from('coach_athlete_assignments')
      .select('*')
      .eq('athlete_user_id', userId);
    if (coachAssignments?.length) {
      exportData.coach_assignments = coachAssignments;
      exportData.export_info.data_categories.push('coach_assignments');
    }

    // KPI share tokens
    const { data: shareTokens } = await supabase
      .from('kpi_share_tokens')
      .select('id, label, expires_at, include_stats, include_goals, include_videos, view_count, created_at')
      .eq('user_id', userId);
    if (shareTokens?.length) {
      exportData.kpi_share_tokens = shareTokens;
      exportData.export_info.data_categories.push('kpi_share_tokens');
    }

    // User purchases
    const { data: purchases } = await supabase
      .from('user_purchases')
      .select('*')
      .eq('user_id', userId);
    if (purchases?.length) {
      exportData.user_purchases = purchases;
      exportData.export_info.data_categories.push('user_purchases');
    }

    // Notification preferences
    const { data: notifPrefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (notifPrefs) {
      exportData.notification_preferences = notifPrefs;
      exportData.export_info.data_categories.push('notification_preferences');
    }

    // Notifications received
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);
    if (notifications?.length) {
      exportData.notifications = notifications;
      exportData.export_info.data_categories.push('notifications');
    }

    // User roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role, created_at')
      .eq('user_id', userId);
    if (roles?.length) {
      exportData.user_roles = roles;
      exportData.export_info.data_categories.push('user_roles');
    }

    // Session history (anonymized)
    const { data: sessionHistory } = await supabase
      .from('user_sessions')
      .select('browser, os, device_info, location, created_at, last_active_at')
      .eq('user_id', userId);
    if (sessionHistory?.length) {
      exportData.session_history = sessionHistory;
      exportData.export_info.data_categories.push('session_history');
    }

    console.log(`Export completed. Categories: ${exportData.export_info.data_categories.length}`);

    return new Response(
      JSON.stringify(exportData, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="vault-data-export-${new Date().toISOString().split('T')[0]}.json"`,
        } 
      }
    );
  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to export data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
