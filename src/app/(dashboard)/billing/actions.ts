"use server";

import { createClient as createServerClient } from "@/core/supabase/server";
import { revalidatePath } from "next/cache";

export async function getBillingStats() {
  const supabase = await createServerClient();
  
  try {
    const { data: result, error } = await supabase
      .rpc('get_billing_stats');

    if (error) throw error;

    return {
      success: true,
      data: result?.stats || {}
    };
  } catch (err: any) {
    console.error("Error fetching billing stats:", err);
    return { 
      success: false, 
      error: err.message,
      data: {} 
    };
  }
}

export async function getInvoices(
  status?: string,
  studentId?: string,
  month?: string
) {
  const supabase = await createServerClient();
  
  try {
    const { data: result, error } = await supabase
      .rpc('get_invoices_data', {
        p_status: status || null,
        p_student_id: studentId || null,
        p_month: month ? new Date(month + '-01') : null
      });

    if (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }

    return {
      success: true,
      data: result?.invoices || []
    };
  } catch (err: any) {
    console.error("Error fetching invoices:", err);
    return { 
      success: false, 
      error: err.message,
      data: [] 
    };
  }
}

export async function getMonthlyRevenue() {
  const supabase = await createServerClient();
  
  try {
    const { data: result, error } = await supabase
      .rpc('get_monthly_revenue');

    if (error) {
      console.error('Error fetching monthly revenue:', error);
      throw error;
    }

    return {
      success: true,
      data: result?.data || []
    };
  } catch (err: any) {
    console.error("Error fetching monthly revenue:", err);
    return { 
      success: false, 
      error: err.message,
      data: [] 
    };
  }
}

export async function getStudentsForInvoice() {
  const supabase = await createServerClient();
  
  try {
    // First, get all students
    const { data: students, error: studentsError } = await supabase
      .schema('academic')
      .from('students')
      .select('profile_id, student_code')
      .order('student_code', { ascending: true });

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      throw studentsError;
    }

    if (!students || students.length === 0) {
      return {
        success: true,
        data: []
      };
    }

    // Get profile IDs
    const profileIds = students.map(s => s.profile_id);

    // Get profiles separately
    const { data: profiles, error: profilesError } = await supabase
      .schema('identity')
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', profileIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    // Combine the data
    const formattedStudents = students.map((s: any) => {
      const profile = profiles?.find(p => p.id === s.profile_id);
      return {
        id: s.profile_id,
        full_name: profile?.full_name || '',
        student_code: s.student_code,
        email: profile?.email || '',
        phone: profile?.phone || '',
      };
    });

    return {
      success: true,
      data: formattedStudents
    };
  } catch (err: any) {
    console.error("Error fetching students:", err);
    return { 
      success: false, 
      error: err.message,
      data: [] 
    };
  }
}

export async function getStudentEnrollments(studentId: string) {
  const supabase = await createServerClient();
  
  try {
    const { data: enrollments, error } = await supabase
      .schema('academic')
      .from('enrollments')
      .select(`
        group_id,
        status,
        groups:group_id (
          id,
          name,
          monthly_price,
          subject:subject_id (
            id,
            name_ar,
            name_en
          )
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching student enrollments:', error);
      throw error;
    }

    return {
      success: true,
      data: enrollments || []
    };
  } catch (err: any) {
    console.error("Error fetching student enrollments:", err);
    return { 
      success: false, 
      error: err.message,
      data: [] 
    };
  }
}

// app/dashboard/billing/actions.ts

export async function createInvoice(
  studentId: string,
  billingMonth: string,
  dueDate: string,
  items: Array<{ group_id: string; description: string; unit_price: number; quantity: number }>,
  notes?: string
) {
  const supabase = await createServerClient();

  try {
    // Check if invoice already exists for this student and month
    const { data: existingInvoice, error: checkError } = await supabase
      .schema('billing')
      .from('invoices')
      .select('id, status, invoice_number')
      .eq('student_id', studentId)
      .eq('billing_month', billingMonth + '-01')
      .neq('status', 'cancelled')
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingInvoice) {
      return { 
        success: false, 
        error: `فاتورة هذا الشهر موجودة بالفعل (رقم: ${existingInvoice.invoice_number || ''})`,
        existing: true,
        invoiceId: existingInvoice.id
      };
    }

    // Create the invoice
    const { data: result, error } = await supabase
      .rpc('create_invoice', {
        p_student_id: studentId,
        p_billing_month: billingMonth + '-01',
        p_due_date: dueDate,
        p_items: items,
        p_notes: notes || null
      });

    if (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }

    revalidatePath('/dashboard/billing');
    return { 
      success: true, 
      data: result 
    };
  } catch (err: any) {
    console.error("Error creating invoice:", err);
    return { success: false, error: err.message };
  }
}

export async function recordPayment(
  invoiceId: string,
  amount: number,
  method: string,
  transactionReference?: string,
  notes?: string
) {
  const supabase = await createServerClient();

  try {
    const { data: result, error } = await supabase
      .rpc('record_payment', {
        p_invoice_id: invoiceId,
        p_amount: amount,
        p_method: method,
        p_transaction_reference: transactionReference || null,
        p_notes: notes || null
      });

    if (error) {
      console.error('Error recording payment:', error);
      throw error;
    }

    revalidatePath('/dashboard/billing');
    return { 
      success: true, 
      data: result 
    };
  } catch (err: any) {
    console.error("Error recording payment:", err);
    return { success: false, error: err.message };
  }
}

