import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SportType, SportConfig, getSportConfig } from "@/lib/sportTypes";

export type SoftballFormat = "fastpitch" | "slowpitch";

interface SportContextType {
  sport: SportType;
  sportConfig: SportConfig;
  softballFormat: SoftballFormat;
  setSport: (sport: SportType) => Promise<void>;
  setSoftballFormat: (format: SoftballFormat) => Promise<void>;
  loading: boolean;
}

const SportContext = createContext<SportContextType>({
  sport: 'baseball',
  sportConfig: getSportConfig('baseball'),
  softballFormat: 'fastpitch',
  setSport: async () => {},
  setSoftballFormat: async () => {},
  loading: false,
});

export const useSport = () => useContext(SportContext);

export const SportProvider = ({ children }: { children: ReactNode }) => {
  const [sport, setSportState] = useState<SportType>('baseball');
  const [softballFormat, setSoftballFormatState] = useState<SoftballFormat>('fastpitch');
  const [loading, setLoading] = useState(false);

  const loadFromProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('sport_type, softball_format')
        .eq('user_id', userId)
        .single();

      if (data?.sport_type) {
        setSportState(data.sport_type as SportType);
      }
      if (data?.softball_format) {
        setSoftballFormatState(data.softball_format as SoftballFormat);
      }
    } catch (err) {
      console.error('Error loading sport preference:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadFromProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error loading sport preference:', err);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadFromProfile(session.user.id);
      } else {
        setSportState('baseball');
        setSoftballFormatState('fastpitch');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setSport = async (newSport: SportType) => {
    setSportState(newSport);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('profiles')
          .update({ sport_type: newSport } as any)
          .eq('user_id', session.user.id);
      }
    } catch (err) {
      console.error('Error saving sport preference:', err);
    }
  };

  const setSoftballFormat = async (format: SoftballFormat) => {
    setSoftballFormatState(format);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('profiles')
          .update({ softball_format: format } as any)
          .eq('user_id', session.user.id);
      }
    } catch (err) {
      console.error('Error saving softball format:', err);
    }
  };

  return (
    <SportContext.Provider value={{
      sport,
      sportConfig: getSportConfig(sport),
      softballFormat,
      setSport,
      setSoftballFormat,
      loading,
    }}>
      {children}
    </SportContext.Provider>
  );
};
