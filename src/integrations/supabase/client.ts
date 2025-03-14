
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
      const timeout = 10000; // Giảm timeout xuống 10 giây để tăng trải nghiệm người dùng
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
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
});

// Re-export functions from other files for backwards compatibility
export * from './courseServices';
// Remove the duplicate export of 'fetchCourseTests' from testServices
// and explicitly export the other functions from testServices
export { 
  fetchTestQuestions, 
  saveTestResult, 
  getChapterTestProgress 
} from './testServices';
export * from './userProgressServices';

// Define a return type for the VIP status
export interface VipStatus {
  isVip: boolean;
  daysRemaining: number | null;
}

// Utility function to check if user has VIP access
export const checkVipAccess = async (userId: string): Promise<VipStatus> => {
  if (!userId) return { isVip: false, daysRemaining: null };
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_vip, vip_expiration_date')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking VIP status:', error);
      return { isVip: false, daysRemaining: null };
    }
    
    if (!data || !data.is_vip) {
      return { isVip: false, daysRemaining: null };
    }
    
    // Check if VIP has expired
    if (data.vip_expiration_date) {
      const expiryDate = new Date(data.vip_expiration_date);
      const currentDate = new Date();
      
      // Calculate days remaining
      const diffTime = expiryDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If expired, update the profile
      if (expiryDate < currentDate) {
        await supabase
          .from('profiles')
          .update({ is_vip: false })
          .eq('id', userId);
        
        return { isVip: false, daysRemaining: null };
      }
      
      return { isVip: true, daysRemaining: diffDays };
    }
    
    return { isVip: true, daysRemaining: null };
  } catch (error) {
    console.error('Exception checking VIP status:', error);
    return { isVip: false, daysRemaining: null };
  }
};
