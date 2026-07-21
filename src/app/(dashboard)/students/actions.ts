'use server'

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/core/supabase/server";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function generateRandomPassword(length = 10) {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateEmailFromName(name: string) {
  const cleanName = name.replace(/\s/g, "").toLowerCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randomNum}@abakera.com`;
}

export async function saveStudentToDatabase(data: any) {
  const supabase = await createServerClient();

  const sanitizedGender = data.gender === "" ? null : data.gender;
  const sanitizedGrade = data.grade_id === "" ? null : data.grade_id;

  const { data: center } = await supabase.schema("core").from("centers").select("id").single();
  if (!center) return { error: "Center not found" };

  try {
    // 1. إنشاء حساب الطالب (Auth)
    const studentPassword = generateRandomPassword();
    const studentEmail = generateEmailFromName(data.full_name);

    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: studentEmail,
      password: studentPassword,
      email_confirm: true,
      user_metadata: { full_name: data.full_name }
    });

    if (authErr) throw authErr;

    // 2. إعداد بروفايل الطالب يدوياً (بدلاً من الـ RPC المتعطل)
    // ملاحظة: الـ Trigger قد يكون أنشأ الصف بالفعل، لذا نستخدم upsert
    await supabaseAdmin
      .schema('identity')
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        full_name: data.full_name,
        email: studentEmail,
        phone: data.whatsapp_number,
        is_active: true
      });

    // ربط الطالب بالسنتر
    await supabaseAdmin.schema('identity').from('center_members').upsert({
      center_id: center.id,
      profile_id: authUser.user.id,
      is_active: true
    });

    // تعيين رتبة طالب
    const { data: studentRole } = await supabase.schema('identity').from('roles').select('id').eq('name', 'student').single();
    if (studentRole) {
        await supabaseAdmin.schema('identity').from('profile_roles').upsert({
          profile_id: authUser.user.id,
          role_id: studentRole.id
        });
    }

    // 3. إنشاء سجل الطالب الأكاديمي
    const { error: studentErr } = await supabaseAdmin
      .schema("academic")
      .from("students")
      .insert({
        profile_id: authUser.user.id,
        center_id: center.id,
        grade_id: sanitizedGrade,
        gender: sanitizedGender,
        school: data.school,
        status: data.status,
        registration_date: new Date().toISOString().split("T")[0],
      });

    if (studentErr) throw studentErr;

    // 4. إنشاء سجل ولي الأمر (Academic)
    const parentName = data.parent_name || `والد/ة ${data.full_name}`;
    const { data: parentRecord, error: parentErr } = await supabaseAdmin
      .schema("academic")
      .from("parents")
      .insert({
        center_id: center.id,
        full_name: parentName,
        phone: data.whatsapp_number,
        whatsapp: data.whatsapp_number,
      })
      .select().single();

    if (parentErr) throw parentErr;

    // ربط الطالب بولي الأمر
    await supabaseAdmin.schema("academic").from("student_parents").insert({
      student_id: authUser.user.id,
      parent_id: parentRecord.id,
      relationship: "Father",
    });

    // 5. إنشاء حساب Auth لولي الأمر
    const parentPassword = generateRandomPassword();
    const parentEmail = generateEmailFromName(parentName);

    const { data: authParent, error: authParentErr } = await supabaseAdmin.auth.admin.createUser({
      email: parentEmail,
      password: parentPassword,
      email_confirm: true,
      user_metadata: { full_name: parentName }
    });

    if (!authParentErr && authParent) {
       // إعداد بروفايل ولي الأمر
       await supabaseAdmin.schema('identity').from('profiles').upsert({
          id: authParent.user.id,
          full_name: parentName,
          email: parentEmail,
          phone: data.whatsapp_number
       });

       await supabaseAdmin.schema('identity').from('center_members').upsert({
          center_id: center.id,
          profile_id: authParent.user.id
       });

       const { data: parentRole } = await supabase.schema('identity').from('roles').select('id').eq('name', 'parent').single();
       if (parentRole) {
           await supabaseAdmin.schema('identity').from('profile_roles').upsert({
             profile_id: authParent.user.id,
             role_id: parentRole.id
           });
       }
    }

    revalidatePath("/dashboard/students");

    return {
      success: true,
      studentId: authUser.user.id,
      studentCredentials: { email: studentEmail, password: studentPassword },
      parentCredentials: { email: parentEmail, password: parentPassword },
    };
  } catch (err: any) {
    console.error("Critical Registration Error:", err);
    return { error: err.message };
  }
}

// Delete student
export async function deleteStudent(id: string) {
  const supabase = await createServerClient();
  
  // First delete from profiles (cascade will handle related records)
  const { error } = await supabase
    .schema('identity')
    .from('profiles')
    .delete()
    .eq('id', id);
  
  if (error) return { error: error.message };
  
  // Also delete from auth.users (using admin API)
  try {
    await supabaseAdmin.auth.admin.deleteUser(id);
  } catch (err) {
    // If auth user deletion fails, log but don't fail the whole operation
    console.error("Failed to delete auth user:", err);
  }
  
  revalidatePath('/dashboard/students');
  return { success: true };
}

// Update student
export async function updateStudent(id: string, data: any) {
  const supabase = await createServerClient();
  try {
    // Update profile
    await supabase
      .schema('identity')
      .from('profiles')
      .update({
        full_name: data.full_name,
        phone: data.whatsapp_number
      })
      .eq('id', id);

    // Update student record
    await supabase
      .schema('academic')
      .from('students')
      .update({
        grade_id: data.grade_id,
        school: data.school,
        gender: data.gender
      })
      .eq('profile_id', id);

    revalidatePath('/dashboard/students');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}


// Add this to your actions.ts file

export async function getStagesAndGrades() {
  const supabase = await createServerClient();
  
  try {
    // Fetch stages with their grades
    const { data: stages, error: stagesError } = await supabase
      .schema('academic')
      .from('stages')
      .select(`
        id,
        name_ar,
        name_en,
        display_order,
        grades (
          id,
          name_ar,
          name_en,
          display_order
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (stagesError) throw stagesError;

    return {
      success: true,
      data: stages || []
    };
  } catch (err: any) {
    console.error("Error fetching stages and grades:", err);
    return { 
      success: false, 
      error: err.message 
    };
  }
}

// Add this to your actions.ts file

export async function getGroupsForStudent(gradeId?: string) {
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

    // Build the query
    let query = supabase
      .schema('academic')
      .from('groups')
      .select(`
        id,
        name,
        subject:subject_id (
          id,
          name_ar,
          name_en
        ),
        grade:grade_id (
          id,
          name_ar,
          name_en,
          stage_id
        ),
        capacity,
        monthly_price,
        status
      `)
      .eq('center_id', center.id)
      .eq('status', 'active')
      .order('name', { ascending: true });

    // If gradeId is provided, filter groups by grade
    if (gradeId) {
      query = query.eq('grade_id', gradeId);
    }

    const { data: groups, error } = await query;

    if (error) throw error;

    // Format groups for display
    const formattedGroups = (groups || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      subject_name: g.subject?.name_ar || g.subject?.name_en || '',
      grade_name: g.grade?.name_ar || g.grade?.name_en || '',
      grade_id: g.grade?.id,
      stage_id: g.grade?.stage_id,
      capacity: g.capacity,
      monthly_price: g.monthly_price,
      status: g.status,
      display_name: `${g.name} (${g.subject?.name_ar || ''} - ${g.grade?.name_ar || ''})`
    }));

    return {
      success: true,
      data: formattedGroups
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

// Get student's current groups
export async function getStudentGroups(studentId: string) {
  const supabase = await createServerClient();
  
  try {
    const { data: enrollments, error } = await supabase
      .schema('academic')
      .from('enrollments')
      .select(`
        id,
        group_id,
        status,
        enrolled_at,
        groups:group_id (
          id,
          name,
          subject:subject_id (
            id,
            name_ar,
            name_en
          ),
          grade:grade_id (
            id,
            name_ar,
            name_en
          )
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (error) throw error;

    return {
      success: true,
      data: enrollments || []
    };
  } catch (err: any) {
    console.error("Error fetching student groups:", err);
    return { 
      success: false, 
      error: err.message,
      data: [] 
    };
  }
}

// Update student's groups
export async function updateStudentGroups(studentId: string, groupIds: string[]) {
  const supabase = await createServerClient();

  try {
    // First, get current active enrollments
    const { data: currentEnrollments, error: fetchError } = await supabase
      .schema('academic')
      .from('enrollments')
      .select('id, group_id')
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (fetchError) throw fetchError;

    // Get current group IDs
    const currentGroupIds = currentEnrollments?.map(e => e.group_id) || [];

    // Find groups to remove (in current but not in new)
    const groupsToRemove = currentGroupIds.filter(id => !groupIds.includes(id));

    // Find groups to add (in new but not in current)
    const groupsToAdd = groupIds.filter(id => !currentGroupIds.includes(id));

    // Remove groups
    if (groupsToRemove.length > 0) {
      const { error: removeError } = await supabase
        .schema('academic')
        .from('enrollments')
        .update({ status: 'cancelled' })
        .eq('student_id', studentId)
        .in('group_id', groupsToRemove)
        .eq('status', 'active');

      if (removeError) throw removeError;
    }

    // Add groups
    if (groupsToAdd.length > 0) {
      const enrollmentsToAdd = groupsToAdd.map(groupId => ({
        student_id: studentId,
        group_id: groupId,
        status: 'active',
        enrolled_at: new Date().toISOString()
      }));

      const { error: addError } = await supabase
        .schema('academic')
        .from('enrollments')
        .insert(enrollmentsToAdd);

      if (addError) throw addError;
    }

    revalidatePath('/dashboard/students');
    return { success: true };
  } catch (err: any) {
    console.error("Error updating student groups:", err);
    return { success: false, error: err.message };
  }
}