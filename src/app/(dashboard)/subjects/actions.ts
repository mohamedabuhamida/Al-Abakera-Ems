"use server";

import { createClient as createServerClient } from "@/core/supabase/server";
import { revalidatePath } from "next/cache";

interface SubjectData {
  name_ar: string;
  name_en?: string;
  code?: string;
  color?: string;
  description?: string;
}

export async function getSubjects() {
  const supabase = await createServerClient();
  
  try {
    const { data: subjects, error } = await supabase
      .schema('academic')
      .from('subjects')
      .select('*')
      .order('name_ar', { ascending: true });

    if (error) throw error;

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

export async function createSubject(data: SubjectData) {
  const supabase = await createServerClient();

  try {
    // Get the center ID
    const { data: center } = await supabase
      .schema("core")
      .from("centers")
      .select("id")
      .single();

    if (!center) return { error: "Center not found" };

    const { data: subject, error } = await supabase
      .schema('academic')
      .from('subjects')
      .insert({
        center_id: center.id,
        name_ar: data.name_ar,
        name_en: data.name_en || null,
        code: data.code || null,
        color: data.color || '#000000',
        description: data.description || null,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/subjects');
    return { success: true, data: subject };
  } catch (err: any) {
    console.error("Error creating subject:", err);
    return { success: false, error: err.message };
  }
}

export async function updateSubject(id: string, data: SubjectData) {
  const supabase = await createServerClient();

  try {
    const { data: subject, error } = await supabase
      .schema('academic')
      .from('subjects')
      .update({
        name_ar: data.name_ar,
        name_en: data.name_en || null,
        code: data.code || null,
        color: data.color || '#000000',
        description: data.description || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/subjects');
    return { success: true, data: subject };
  } catch (err: any) {
    console.error("Error updating subject:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteSubject(id: string) {
  const supabase = await createServerClient();

  try {
    // Check if subject is being used by teachers
    const { data: teacherSubjects, error: checkError } = await supabase
      .schema('academic')
      .from('teacher_subjects')
      .select('teacher_id')
      .eq('subject_id', id)
      .limit(1);

    if (checkError) throw checkError;

    if (teacherSubjects && teacherSubjects.length > 0) {
      return { 
        success: false, 
        error: "لا يمكن حذف المادة لأنها مستخدمة من قبل معلمين" 
      };
    }

    const { error } = await supabase
      .schema('academic')
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard/subjects');
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting subject:", err);
    return { success: false, error: err.message };
  }
}

export async function getSubjectTeachers(subjectId: string) {
  const supabase = await createServerClient();

  try {
    const { data: teachers, error } = await supabase
      .schema('academic')
      .from('teacher_subjects')
      .select(`
        teacher_id,
        teachers:teacher_id (
          profile_id,
          status,
          profiles:identity!profile_id (
            id,
            full_name,
            email,
            phone
          )
        )
      `)
      .eq('subject_id', subjectId);

    if (error) throw error;

    return {
      success: true,
      data: teachers?.map((t: any) => ({
        id: t.teachers?.profile_id,
        full_name: t.teachers?.profiles?.full_name,
        email: t.teachers?.profiles?.email,
        phone: t.teachers?.profiles?.phone,
        status: t.teachers?.status,
      })).filter(Boolean) || []
    };
  } catch (err: any) {
    console.error("Error fetching subject teachers:", err);
    return { success: false, error: err.message, data: [] };
  }
}