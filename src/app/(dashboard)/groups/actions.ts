"use server";

import { createClient as createServerClient } from "@/core/supabase/server";
import { revalidatePath } from "next/cache";

interface GroupData {
  name: string;
  description?: string;
  capacity?: number;
  monthly_price?: number;
  status?: string;
  subject_id: string;
  grade_id: string;
}

interface SessionData {
  weekday: number;
  start_time: string;
  end_time: string;
  teacher_id: string;
  classroom_id?: string;
}

export async function checkTeacherAvailability(
  teacherId: string,
  weekday: number,
  startTime: string,
  endTime: string,
  excludeSessionId?: string
) {
  const supabase = await createServerClient();
  
  try {
    const { data: result, error } = await supabase
      .rpc('check_teacher_availability', {
        p_teacher_id: teacherId,
        p_weekday: weekday,
        p_start_time: startTime,
        p_end_time: endTime,
        p_exclude_session_id: excludeSessionId || null
      });

    if (error) throw error;

    return {
      success: true,
      available: result || false
    };
  } catch (err: any) {
    console.error("Error checking teacher availability:", err);
    return { 
      success: false, 
      error: err.message,
      available: false 
    };
  }
}

export async function getTeacherSchedule(teacherId: string) {
  const supabase = await createServerClient();
  
  try {
    // Use the function name without schema prefix since it's in public
    const { data: result, error } = await supabase
      .rpc('get_teacher_conflicts', {
        p_teacher_id: teacherId
      });

    if (error) {
      console.error('Error fetching teacher schedule:', error);
      throw error;
    }

    return {
      success: true,
      data: result?.sessions || []
    };
  } catch (err: any) {
    console.error("Error fetching teacher schedule:", err);
    return { 
      success: false, 
      error: err.message,
      data: [] 
    };
  }
}

// export async function checkTeacherAvailability(
//   teacherId: string,
//   weekday: number,
//   startTime: string,
//   endTime: string,
//   excludeSessionId?: string
// ) {
//   const supabase = await createServerClient();
  
//   try {
//     const { data: result, error } = await supabase
//       .rpc('check_teacher_availability', {
//         p_teacher_id: teacherId,
//         p_weekday: weekday,
//         p_start_time: startTime,
//         p_end_time: endTime,
//         p_exclude_session_id: excludeSessionId || null
//       });

//     if (error) {
//       console.error('Error checking teacher availability:', error);
//       throw error;
//     }

//     return {
//       success: true,
//       available: result || false
//     };
//   } catch (err: any) {
//     console.error("Error checking teacher availability:", err);
//     return { 
//       success: false, 
//       error: err.message,
//       available: false 
//     };
//   }
// }

export async function getGroups() {
  const supabase = await createServerClient();
  
  try {
    const { data: groups, error } = await supabase
      .schema('academic')
      .from('groups')
      .select(`
        *,
        subject:subject_id (
          id, name_ar, name_en, code, color
        ),
        grade:grade_id (
          id, name_ar, name_en
        )
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: groups || []
    };
  } catch (err: any) {
    console.error("Error fetching groups:", err);
    return { 
      success: false, 
      error: err.message,
      data: [] 
    };
  }
}

export async function createGroup(data: GroupData) {
  const supabase = await createServerClient();

  try {
    const { data: center } = await supabase
      .schema("core")
      .from("centers")
      .select("id")
      .single();

    if (!center) return { error: "Center not found" };

    const { data: group, error } = await supabase
      .schema('academic')
      .from('groups')
      .insert({
        center_id: center.id,
        name: data.name,
        description: data.description || null,
        capacity: data.capacity || 30,
        monthly_price: data.monthly_price || 0,
        status: data.status || 'active',
        subject_id: data.subject_id,
        grade_id: data.grade_id,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/groups');
    return { success: true, data: group };
  } catch (err: any) {
    console.error("Error creating group:", err);
    return { success: false, error: err.message };
  }
}

export async function updateGroup(id: string, data: GroupData) {
  const supabase = await createServerClient();

  try {
    const { data: group, error } = await supabase
      .schema('academic')
      .from('groups')
      .update({
        name: data.name,
        description: data.description || null,
        capacity: data.capacity || 30,
        monthly_price: data.monthly_price || 0,
        status: data.status || 'active',
        subject_id: data.subject_id,
        grade_id: data.grade_id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/groups');
    return { success: true, data: group };
  } catch (err: any) {
    console.error("Error updating group:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteGroup(id: string) {
  const supabase = await createServerClient();

  try {
    const { data: enrollments, error: checkError } = await supabase
      .schema('academic')
      .from('enrollments')
      .select('id')
      .eq('group_id', id)
      .limit(1);

    if (checkError) throw checkError;

    if (enrollments && enrollments.length > 0) {
      return { 
        success: false, 
        error: "لا يمكن حذف المجموعة لأن بها طلاب مسجلين" 
      };
    }

    await supabase
      .schema('academic')
      .from('group_sessions')
      .delete()
      .eq('group_id', id);

    const { error } = await supabase
      .schema('academic')
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard/groups');
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting group:", err);
    return { success: false, error: err.message };
  }
}

export async function getSubjects() {
  const supabase = await createServerClient();
  
  try {
    const { data: center } = await supabase
      .schema("core")
      .from("centers")
      .select("id")
      .single();

    if (!center) {
      return { 
        success: false, 
        error: "Center not found",
        data: [] 
      };
    }

    const { data: subjects, error } = await supabase
      .schema('academic')
      .from('subjects')
      .select('id, name_ar, name_en, code, color')
      .eq('center_id', center.id)
      .order('name_ar', { ascending: true });

    if (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }

    return {
      success: true,
      data: subjects || []
    };
  } catch (err: any) {
    console.error("Error fetching subjects:", err);
    return { 
      success: false, 
      error: err.message,
      data: [] 
    };
  }
}

export async function getGrades() {
  const supabase = await createServerClient();
  
  try {
    const { data: grades, error } = await supabase
      .schema('academic')
      .from('grades')
      .select(`
        id, 
        name_ar, 
        name_en, 
        display_order,
        stage:stage_id (
          id,
          name_ar,
          name_en
        )
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }

    return {
      success: true,
      data: grades || []
    };
  } catch (err: any) {
    console.error("Error fetching grades:", err);
    return { 
      success: false, 
      error: err.message,
      data: [] 
    };
  }
}

export async function getTeachers() {
  const supabase = await createServerClient();
  
  try {
    // 1. Get all teachers from academic schema
    const { data: teachers, error: teachersError } = await supabase
      .schema('academic')
      .from('teachers')
      .select('profile_id, status');

    if (teachersError) {
      console.error('Error fetching teachers:', teachersError);
      throw teachersError;
    }

    if (!teachers || teachers.length === 0) {
      return {
        success: true,
        data: []
      };
    }

    // 2. Get profile IDs from teachers
    const profileIds = teachers.map(t => t.profile_id);

    // 3. Get profiles from identity schema
    const { data: profiles, error: profilesError } = await supabase
      .schema('identity')
      .from('profiles')
      .select('id, full_name, email, phone, avatar_url')
      .in('id', profileIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    // 4. Get teacher subject assignments
    const { data: teacherSubjects, error: teacherSubjectsError } = await supabase
      .schema('academic')
      .from('teacher_subjects')
      .select('teacher_id, subject_id');

    if (teacherSubjectsError) {
      console.error('Error fetching teacher subjects:', teacherSubjectsError);
      throw teacherSubjectsError;
    }

    // 5. Group teacher subjects by teacher_id
    const teacherSubjectsMap: Record<string, string[]> = {};
    (teacherSubjects || []).forEach((ts: any) => {
      if (!teacherSubjectsMap[ts.teacher_id]) {
        teacherSubjectsMap[ts.teacher_id] = [];
      }
      teacherSubjectsMap[ts.teacher_id].push(ts.subject_id);
    });

    // 6. Combine the data
    const formattedTeachers = teachers
      .filter((t: any) => t.status === 'active')
      .map((t: any) => {
        const profile = profiles?.find(p => p.id === t.profile_id);
        return {
          id: t.profile_id,
          full_name: profile?.full_name || 'Unknown Teacher',
          email: profile?.email || '',
          phone: profile?.phone || '',
          status: t.status,
          subject_ids: teacherSubjectsMap[t.profile_id] || [],
        };
      });

    console.log('Formatted teachers:', formattedTeachers);

    return {
      success: true,
      data: formattedTeachers
    };
  } catch (err: any) {
    console.error("Error fetching teachers:", err);
    return { 
      success: false, 
      error: err.message,
      data: [] 
    };
  }
}

export async function getClassrooms() {
  const supabase = await createServerClient();
  
  try {
    const { data: center } = await supabase
      .schema("core")
      .from("centers")
      .select("id")
      .single();

    if (!center) {
      return { 
        success: false, 
        error: "Center not found",
        data: [] 
      };
    }

    const { data: classrooms, error } = await supabase
      .schema('academic')
      .from('classrooms')
      .select('id, name, capacity, floor, notes')
      .eq('center_id', center.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching classrooms:', error);
      throw error;
    }

    return {
      success: true,
      data: classrooms || []
    };
  } catch (err: any) {
    console.error("Error fetching classrooms:", err);
    return { 
      success: false, 
      error: err.message,
      data: [] 
    };
  }
}

export async function addGroupSessions(groupId: string, sessions: SessionData[]) {
  const supabase = await createServerClient();

  try {
    // Check for teacher conflicts before adding sessions
    for (const session of sessions) {
      if (session.teacher_id) {
        const { available, error } = await checkTeacherAvailability(
          session.teacher_id,
          session.weekday,
          session.start_time,
          session.end_time
        );

        if (error) {
          throw new Error(`Error checking availability: ${error}`);
        }

        if (!available) {
          // Get teacher name for better error message
          const { data: teacher } = await supabase
            .schema('academic')
            .from('teachers')
            .select('profiles:profile_id (full_name)')
            .eq('profile_id', session.teacher_id)
            .single();

          const teacherName = teacher?.profiles?.[0]?.full_name || 'Unknown Teacher';
          const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
          
          return { 
            success: false, 
            error: `المعلم ${teacherName} مشغول في ${dayNames[session.weekday]} من ${session.start_time} إلى ${session.end_time}`
          };
        }
      }
    }

    // Delete existing sessions
    await supabase
      .schema('academic')
      .from('group_sessions')
      .delete()
      .eq('group_id', groupId);

    // Add new sessions
    if (sessions.length > 0) {
      const sessionData = sessions.map(s => ({
        group_id: groupId,
        weekday: s.weekday,
        start_time: s.start_time,
        end_time: s.end_time,
        teacher_id: s.teacher_id,
        classroom_id: s.classroom_id || null,
      }));

      const { error } = await supabase
        .schema('academic')
        .from('group_sessions')
        .insert(sessionData);

      if (error) throw error;
    }

    revalidatePath('/dashboard/groups');
    return { success: true };
  } catch (err: any) {
    console.error("Error adding group sessions:", err);
    return { success: false, error: err.message };
  }
}