import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getFormatVisibility, getAgeGroupRules, type FormatVisibility, type AgeGroupRules } from "@/lib/softball/rules";

export interface SoftballProfileContext {
  user: any;
  profile: any;
  format: string;
  ageGroup: string | null;
  visibility: FormatVisibility;
  ageRules: AgeGroupRules;
  loading: boolean;
}

export const useSoftballProfile = (): SoftballProfileContext => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/auth"); return; }
      setUser(session.user);

      const { data } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).single();
      if (data) setProfile(data);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const format = profile?.softball_format || "fastpitch";
  const ageGroup = profile?.age_group || null;

  return {
    user,
    profile,
    format,
    ageGroup,
    visibility: getFormatVisibility(format, ageGroup),
    ageRules: getAgeGroupRules(ageGroup),
    loading,
  };
};
