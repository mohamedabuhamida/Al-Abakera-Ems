import { createClient } from "@/core/supabase/client";
import { useEffect, useState } from "react";

export function useGroups() {
  const supabase = createClient();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchGroups() {
    setLoading(true);
    const { data, error } = await supabase
      .schema('academic')
      .from('groups')
      .select(`
        *,
        subject:subjects(name_ar, color),
        grade:grades(name_ar),
        teacher:teachers(profile_id, identity:profiles(full_name)),
        sessions:group_sessions(*)
      `)
      .order('created_at', { ascending: false });

    if (!error) setGroups(data);
    setLoading(false);
  }

  useEffect(() => { fetchGroups(); }, []);

  return { groups, loading, refresh: fetchGroups };
}