
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zrpmghqlhxjwxceqihfg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpycG1naHFsaHhqd3hjZXFpaGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NDQwNDAsImV4cCI6MjA1NzMyMDA0MH0.ZKf1u7-l6oqHCQ-J-U_FG34YcXCEYD0wlyMTQakTmnQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Enable this to detect auth in URL
    flowType: 'pkce', // Use PKCE flow for more secure authentication
    storageKey: 'epu_supabase_auth', // Use a specific key for storage to avoid conflicts
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
    fetch: (url, options) => {
      const timeout = 15000; // Giảm timeout xuống 15 giây thay vì 30 giây
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10 // Reduce events per second for better performance
    }
  },
  db: {
    schema: 'public'
  }
});

// Helper functions for test data
export const fetchTestQuestions = async (chapterId: string) => {
  try {
    const { data, error } = await supabase
      .from('chapter_tests')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching test questions:', error);
    return [];
  }
};

export const saveTestResult = async (
  userId: string, 
  courseId: string,
  chapterId: string,
  lessonId: string,
  score: number, 
  totalQuestions: number
) => {
  try {
    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70;
    
    // First update the lesson progress
    await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        completed: passed,
        last_position: JSON.stringify({
          score,
          total: totalQuestions,
          percentage
        }),
        completed_at: passed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving test result:', error);
    return { success: false, error };
  }
};

// Tối ưu hóa hàm fetchCourseTests để cải thiện hiệu suất
export const fetchCourseTests = async (courseId: string) => {
  try {
    console.log('Fetching course tests for course:', courseId);
    
    // Fetch test info with single query containing both tests and questions
    const { data: testsData, error: testsError } = await supabase
      .from('course_tests')
      .select(`
        *,
        questions:course_test_questions(*)
      `)
      .eq('course_id', courseId);
      
    if (testsError) {
      console.error('Error fetching course tests:', testsError);
      throw testsError;
    }
    
    if (!testsData || testsData.length === 0) {
      console.log('No tests found for course:', courseId);
      return [];
    }
    
    console.log('Successfully fetched tests data:', testsData.length);
    return testsData;
  } catch (error) {
    console.error('Error fetching course tests:', error);
    return [];
  }
};
