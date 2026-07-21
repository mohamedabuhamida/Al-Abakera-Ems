import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/core/supabase/client';

export interface Teacher {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  qualification?: string;
  salary_type?: string;
  salary_value?: number;
  status: 'active' | 'inactive' | 'suspended';
  bio?: string;
  subjects: Array<{
    id: string;
    name: string;
    name_en: string;
    code: string;
    color: string;
  }>;
  active_groups: number;
  total_students: number;
  joined_at: string;
  profiles?: {
    avatar_url: string | null;
  };
}

export function useTeachers() {
  const [data, setData] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { data: result, error: rpcError } = await supabase
        .rpc('get_teachers_data');

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        throw new Error('TEACHERS_LOAD_FAILED');
      }

      if (result?.errors && result.errors.length > 0) {
        console.error('Errors from RPC:', result.errors);
        throw new Error('TEACHERS_LOAD_FAILED');
      }

      setData(result?.teachers || []);
    } catch (err: any) {
      console.error('Failed to load teachers:', err);
      setError(err.message || 'TEACHERS_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return { data, loading, error, refresh: fetchTeachers };
}