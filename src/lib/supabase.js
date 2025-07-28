import { createClient } from '@supabase/supabase-js'

// These values will be replaced with actual values when Supabase is connected
const SUPABASE_URL = 'https://acilsyljzfbyimtpsfos.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjaWxzeWxqemZieWltdHBzZm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTc4NDUsImV4cCI6MjA2NzY3Mzg0NX0.QameTomZDvopL1gin0-Mogg67lkmAcSZNW3r7-8ATSI'

if (SUPABASE_URL === 'https://your-project.supabase.co' || SUPABASE_ANON_KEY === 'your-anon-key') {
  console.warn('⚠️ Supabase not configured. Using local storage fallback.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Initialize Supabase Storage
export const initializeStorage = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return false;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'product-images');
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('product-images', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }
      
      console.log('✅ Storage bucket created successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
};

// Initialize storage on import
initializeStorage();

export default supabase;