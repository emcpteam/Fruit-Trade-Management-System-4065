import { createClient } from '@supabase/supabase-js'

// These values will be replaced with actual values when Supabase is connected
const SUPABASE_URL = 'https://acilsyljzfbyimtpsfos.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjaWxzeWxqemZieWltdHBzZm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTc4NDUsImV4cCI6MjA2NzY3Mzg0NX0.QameTomZDvopL1gin0-Mogg67lkmAcSZNW3r7-8ATSI'

// Check if Supabase is properly configured
const isSupabaseConfigured = SUPABASE_URL !== 'https://your-project.supabase.co' && 
                            SUPABASE_ANON_KEY !== 'your-anon-key' &&
                            !SUPABASE_URL.includes('your-project') &&
                            SUPABASE_URL !== 'https://<PROJECT-ID>.supabase.co'

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured. Using local storage fallback.')
} else {
  console.log('✅ Supabase configured and available for sync')
}

// Create Supabase client with error handling
export const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'trade-management-system'
    }
  }
}) : null

// Test connection function
export const testSupabaseConnection = async () => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured - using local mode' }
  }

  try {
    // Simple test query - try to access auth
    const { data, error } = await supabase.auth.getUser()
    
    if (error && error.message.includes('Invalid JWT')) {
      return { success: false, error: 'Token expired or invalid - using local mode' }
    }

    // If no error, connection is working
    return { success: true, message: 'Supabase connection active' }
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return { success: false, error: `Connection failed: ${error.message}` }
  }
}

// Initialize Supabase Storage with better error handling
export const initializeStorage = async () => {
  if (!supabase) {
    console.log('Supabase not configured, skipping storage initialization')
    return false
  }

  try {
    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError)
      return false
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'product-images')
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (createError) {
        console.error('Error creating bucket:', createError)
        return false
      }
      
      console.log('✅ Storage bucket created successfully')
    }
    
    return true
  } catch (error) {
    console.error('Error initializing storage:', error)
    return false
  }
}

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return supabase !== null && isSupabaseConfigured
}

// Initialize storage if Supabase is configured
if (isSupabaseConfigured && supabase) {
  initializeStorage().catch(console.error)
}

export default supabase