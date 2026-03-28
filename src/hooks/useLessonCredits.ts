import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LessonCredit {
  id: string;
  total_lessons: number;
  used_lessons: number;
  purchased_at: string;
  expires_at: string | null;
}

export const useLessonCredits = () => {
  const [credits, setCredits] = useState<LessonCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingLessons, setRemainingLessons] = useState(0);

  const fetchCredits = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await (supabase.from('lesson_credits' as any) as any)
        .select('*')
        .eq('user_id', session.user.id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      
      const creditsList = (data || []) as LessonCredit[];
      setCredits(creditsList);
      
      const remaining = creditsList.reduce(
        (sum: number, c: LessonCredit) => sum + (c.total_lessons - c.used_lessons), 0
      );
      setRemainingLessons(remaining);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  return { credits, remainingLessons, loading, refetch: fetchCredits };
};
