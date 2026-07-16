'use server'

import { createClient } from '@/core/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "خطأ في البريد الإلكتروني أو كلمة المرور" }
  }

  // Check if user is actually an Admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut()
    return { error: "عذراً، لا تملك صلاحية الوصول للوحة التحكم" }
  }

  redirect('/dashboard')
}