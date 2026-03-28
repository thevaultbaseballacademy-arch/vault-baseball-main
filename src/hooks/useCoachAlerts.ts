import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CoachAlert {
  id: string;
  coach_user_id: string;
  athlete_user_id: string;
  alert_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface AthleteProfile {
  user_id: string;
  display_name: string | null;
  email: string | null;
}

interface CheckinData {
  user_id: string;
  checkin_date: string;
  mood: number | null;
  energy_level: number | null;
  stress_level: number | null;
  sleep_quality: number | null;
}

export function useCoachAlerts(coachUserId: string | null) {
  const [alerts, setAlerts] = useState<CoachAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = useCallback(async () => {
    if (!coachUserId) return;
    
    const { data, error } = await supabase
      .from('coach_alerts')
      .select('*')
      .eq('coach_user_id', coachUserId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching alerts:', error);
      return;
    }

    setAlerts(data || []);
    setUnreadCount(data?.filter(a => !a.is_read).length || 0);
    setLoading(false);
  }, [coachUserId]);

  const generateAlerts = useCallback(async () => {
    if (!coachUserId) return;

    // Fetch all athletes and their check-ins
    // Only select user_id and display_name - email is not needed for coach alerts
    const [athletesResult, checkinsResult] = await Promise.all([
      supabase.from('profiles').select('user_id, display_name'),
      supabase
        .from('athlete_checkins')
        .select('user_id, checkin_date, mood, energy_level, stress_level, sleep_quality')
        .gte('checkin_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('checkin_date', { ascending: false })
    ]);

    if (athletesResult.error || checkinsResult.error) {
      console.error('Error fetching data for alerts');
      return;
    }

    const athletes = athletesResult.data as AthleteProfile[];
    const checkins = checkinsResult.data as CheckinData[];
    const today = new Date();
    const newAlerts: Omit<CoachAlert, 'id' | 'created_at'>[] = [];

    // Get existing alerts to avoid duplicates (last 24 hours)
    const { data: existingAlerts } = await supabase
      .from('coach_alerts')
      .select('athlete_user_id, alert_type')
      .eq('coach_user_id', coachUserId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const existingAlertKeys = new Set(
      existingAlerts?.map(a => `${a.athlete_user_id}-${a.alert_type}`) || []
    );

    for (const athlete of athletes) {
      const athleteCheckins = checkins.filter(c => c.user_id === athlete.user_id);
      const athleteName = athlete.display_name || athlete.email || 'Unknown Athlete';

      // Check for missed check-ins (no check-in in last 2 days)
      if (athleteCheckins.length > 0) {
        const lastCheckin = new Date(athleteCheckins[0].checkin_date);
        const daysSinceLastCheckin = Math.floor((today.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastCheckin >= 2 && !existingAlertKeys.has(`${athlete.user_id}-missed_checkin`)) {
          newAlerts.push({
            coach_user_id: coachUserId,
            athlete_user_id: athlete.user_id,
            alert_type: 'missed_checkin',
            title: 'Missed Check-in',
            message: `${athleteName} hasn't checked in for ${daysSinceLastCheckin} days.`,
            is_read: false
          });
        }

        // Check for concerning wellness trends
        const recentCheckins = athleteCheckins.slice(0, 3);
        
        // Low mood trend (average ≤ 2)
        const avgMood = recentCheckins.filter(c => c.mood).reduce((sum, c) => sum + (c.mood || 0), 0) / recentCheckins.filter(c => c.mood).length;
        if (avgMood <= 2 && !isNaN(avgMood) && !existingAlertKeys.has(`${athlete.user_id}-low_mood`)) {
          newAlerts.push({
            coach_user_id: coachUserId,
            athlete_user_id: athlete.user_id,
            alert_type: 'low_mood',
            title: 'Low Mood Alert',
            message: `${athleteName} has reported low mood levels recently (avg: ${avgMood.toFixed(1)}/5).`,
            is_read: false
          });
        }

        // Low energy trend (average ≤ 2)
        const avgEnergy = recentCheckins.filter(c => c.energy_level).reduce((sum, c) => sum + (c.energy_level || 0), 0) / recentCheckins.filter(c => c.energy_level).length;
        if (avgEnergy <= 2 && !isNaN(avgEnergy) && !existingAlertKeys.has(`${athlete.user_id}-low_energy`)) {
          newAlerts.push({
            coach_user_id: coachUserId,
            athlete_user_id: athlete.user_id,
            alert_type: 'low_energy',
            title: 'Low Energy Alert',
            message: `${athleteName} has reported low energy levels recently (avg: ${avgEnergy.toFixed(1)}/5).`,
            is_read: false
          });
        }

        // High stress trend (average ≥ 4)
        const avgStress = recentCheckins.filter(c => c.stress_level).reduce((sum, c) => sum + (c.stress_level || 0), 0) / recentCheckins.filter(c => c.stress_level).length;
        if (avgStress >= 4 && !isNaN(avgStress) && !existingAlertKeys.has(`${athlete.user_id}-high_stress`)) {
          newAlerts.push({
            coach_user_id: coachUserId,
            athlete_user_id: athlete.user_id,
            alert_type: 'high_stress',
            title: 'High Stress Alert',
            message: `${athleteName} has reported high stress levels recently (avg: ${avgStress.toFixed(1)}/5).`,
            is_read: false
          });
        }

        // Poor sleep quality (average ≤ 2)
        const avgSleep = recentCheckins.filter(c => c.sleep_quality).reduce((sum, c) => sum + (c.sleep_quality || 0), 0) / recentCheckins.filter(c => c.sleep_quality).length;
        if (avgSleep <= 2 && !isNaN(avgSleep) && !existingAlertKeys.has(`${athlete.user_id}-poor_sleep`)) {
          newAlerts.push({
            coach_user_id: coachUserId,
            athlete_user_id: athlete.user_id,
            alert_type: 'poor_sleep',
            title: 'Poor Sleep Quality',
            message: `${athleteName} has reported poor sleep quality recently (avg: ${avgSleep.toFixed(1)}/5).`,
            is_read: false
          });
        }
      }
    }

    // Insert new alerts
    if (newAlerts.length > 0) {
      const { error } = await supabase.from('coach_alerts').insert(newAlerts);
      if (error) {
        console.error('Error inserting alerts:', error);
      } else {
        await fetchAlerts();
        toast({
          title: 'New Alerts',
          description: `${newAlerts.length} new alert(s) generated.`,
        });
      }
    }
  }, [coachUserId, fetchAlerts, toast]);

  const markAsRead = async (alertId: string) => {
    const { error } = await supabase
      .from('coach_alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (!error) {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!coachUserId) return;
    
    const { error } = await supabase
      .from('coach_alerts')
      .update({ is_read: true })
      .eq('coach_user_id', coachUserId)
      .eq('is_read', false);

    if (!error) {
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      setUnreadCount(0);
    }
  };

  const deleteAlert = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    const { error } = await supabase
      .from('coach_alerts')
      .delete()
      .eq('id', alertId);

    if (!error) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      if (alert && !alert.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    unreadCount,
    loading,
    fetchAlerts,
    generateAlerts,
    markAsRead,
    markAllAsRead,
    deleteAlert
  };
}
