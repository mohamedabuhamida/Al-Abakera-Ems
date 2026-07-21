'use server'

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/core/supabase/server";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// --- Helper: Generate a secure random password ---
function generateRandomPassword(length = 10) {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// --- Helper: Generate email from name ---
function generateEmailFromName(name: string) {
  const cleanName = name.replace(/\s/g, "").toLowerCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randomNum}@abakera.com`;
}

interface TeacherData {
  full_name: string;
  email?: string;
  phone?: string;
  qualification?: string;
  salary_type?: string;
  salary_value?: number;
  status?: string;
  bio?: string;
  subject_ids?: string[];
}

export async function saveTeacherToDatabase(data: TeacherData) {
  const supabase = await createServerClient();

  // 1. تنظيف البيانات
  const sanitizedPhone = data.phone === "" ? null : data.phone;
  const sanitizedQualification = data.qualification === "" ? null : data.qualification;
  const sanitizedBio = data.bio === "" ? null : data.bio;
  const sanitizedSalaryType = data.salary_type === "" ? null : data.salary_type;
  const sanitizedSalaryValue = data.salary_value || 0;

  // الحصول على معرف السنتر
  const { data: center } = await supabase
    .schema("core")
    .from("centers")
    .select("id")
    .single();
  
  if (!center) return { error: "Center not found" };

  try {
    // 2. إنشاء حساب المعلم (Auth)
    const teacherPassword = generateRandomPassword();
    const teacherEmail = data.email || generateEmailFromName(data.full_name);

    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: teacherEmail,
      password: teacherPassword,
      email_confirm: true,
      user_metadata: { full_name: data.full_name }
    });

    if (authErr) throw authErr;

    // 3. إعداد بروفايل المعلم يدوياً (بدلاً من الـ RPC)
    // نستخدم upsert لضمان عدم حدوث تعارض مع الـ Trigger
    await supabaseAdmin
      .schema('identity')
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        full_name: data.full_name,
        email: teacherEmail,
        phone: sanitizedPhone,
        is_active: true
      });

    // ربط المعلم بالسنتر
    await supabaseAdmin.schema('identity').from('center_members').upsert({
      center_id: center.id,
      profile_id: authUser.user.id,
      is_active: true
    });

    // تعيين رتبة معلم
    const { data: teacherRole } = await supabaseAdmin
      .schema('identity')
      .from('roles')
      .select('id')
      .eq('name', 'teacher')
      .single();

    if (teacherRole) {
        await supabaseAdmin.schema('identity').from('profile_roles').upsert({
          profile_id: authUser.user.id,
          role_id: teacherRole.id
        });
    }

    // 4. إنشاء سجل المعلم الأكاديمي
    const { error: teacherErr } = await supabaseAdmin
      .schema("academic")
      .from("teachers")
      .insert({
        profile_id: authUser.user.id,
        center_id: center.id,
        qualification: sanitizedQualification,
        salary_type: sanitizedSalaryType,
        salary_value: sanitizedSalaryValue,
        status: data.status || 'active',
        bio: sanitizedBio,
      });

    if (teacherErr) throw teacherErr;

    // 5. ربط المواد بالمعلم
    if (data.subject_ids && data.subject_ids.length > 0) {
      const subjectAssignments = data.subject_ids.map(subject_id => ({
        teacher_id: authUser.user.id,
        subject_id: subject_id
      }));

      const { error: subjectErr } = await supabaseAdmin
        .schema("academic")
        .from("teacher_subjects")
        .insert(subjectAssignments);

      if (subjectErr) throw subjectErr;
    }

    revalidatePath("/dashboard/teachers");

    return {
      success: true,
      teacherCredentials: { 
        email: teacherEmail, 
        password: teacherPassword 
      },
    };
  } catch (err: any) {
    console.error("Teacher Registration Error:", err);
    return { error: err.message };
  }
}

// دالة حذف المعلم (تعديل لتستخدم supabaseAdmin)
export async function deleteTeacher(id: string) {
  try {
    // حذف البروفايل (Cascade سيحذف السجلات المرتبطة في الجداول الأخرى)
    const { error } = await supabaseAdmin
      .schema('identity')
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // حذف حساب الـ Auth
    await supabaseAdmin.auth.admin.deleteUser(id);
    
    revalidatePath('/dashboard/teachers');
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete teacher:", err);
    return { error: err.message };
  }
}

// Update teacher
export async function updateTeacher(id: string, data: TeacherData) {
  const supabase = await createServerClient();
  try {
    // Update profile
    await supabase
      .schema('identity')
      .from('profiles')
      .update({
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
      })
      .eq('id', id);

    // Update teacher record
    await supabase
      .schema('academic')
      .from('teachers')
      .update({
        qualification: data.qualification,
        salary_type: data.salary_type,
        salary_value: data.salary_value,
        status: data.status,
        bio: data.bio,
      })
      .eq('profile_id', id);

    // Update subject assignments
    if (data.subject_ids) {
      // Remove existing assignments
      await supabase
        .schema('academic')
        .from('teacher_subjects')
        .delete()
        .eq('teacher_id', id);

      // Add new assignments
      if (data.subject_ids.length > 0) {
        const subjectAssignments = data.subject_ids.map(subject_id => ({
          teacher_id: id,
          subject_id: subject_id
        }));

        await supabase
          .schema('academic')
          .from('teacher_subjects')
          .insert(subjectAssignments);
      }
    }

    revalidatePath('/dashboard/teachers');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// Get subjects for dropdown
export async function getSubjects() {
  const supabase = await createServerClient();
  
  try {
    const { data: subjects, error } = await supabase
      .schema('academic')
      .from('subjects')
      .select('id, name_ar, name_en, code, color')
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
      error: err.message 
    };
  }
}