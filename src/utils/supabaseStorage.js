import { supabase } from '@/lib/supabase';

export class SupabaseStorageService {
  constructor() {
    this.bucketName = 'product-images';
  }

  // Initialize storage bucket
  async initializeBucket() {
    try {
      // Check if Supabase is properly configured
      const isSupabaseConfigured = !(
        supabase.supabaseUrl.includes('your-project') || 
        supabase.supabaseUrl === 'https://<PROJECT-ID>.supabase.co'
      );

      if (!isSupabaseConfigured) {
        console.log('Supabase not configured, skipping storage initialization');
        return false;
      }

      // Check if bucket exists
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          console.error('Error listing buckets:', bucketError);
          return false;
        }

        const bucketExists = buckets.some(bucket => bucket.name === this.bucketName);
        
        if (!bucketExists) {
          // Create bucket if it doesn't exist
          const { error: createError } = await supabase.storage.createBucket(this.bucketName, {
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
        console.error('Error checking buckets:', error);
        return false;
      }
    } catch (error) {
      console.error('Error initializing bucket:', error);
      return false;
    }
  }

  // Upload image file
  async uploadImage(file, folder = 'products') {
    try {
      // Check if Supabase is properly configured
      const isSupabaseConfigured = !(
        supabase.supabaseUrl.includes('your-project') || 
        supabase.supabaseUrl === 'https://<PROJECT-ID>.supabase.co'
      );

      if (!isSupabaseConfigured) {
        console.log('Supabase not configured, using local file URL');
        // Return a local URL for the file
        const localUrl = URL.createObjectURL(file);
        return {
          success: true,
          data: {
            path: null,
            publicUrl: localUrl,
            fileName: file.name
          }
        };
      }

      // Ensure bucket exists
      const bucketInitialized = await this.initializeBucket();
      if (!bucketInitialized) {
        throw new Error('Unable to initialize storage bucket');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      return {
        success: true,
        data: {
          path: data.path,
          publicUrl: publicUrlData.publicUrl,
          fileName: fileName
        }
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Fallback to local URL if Supabase upload fails
      try {
        const localUrl = URL.createObjectURL(file);
        return {
          success: true,
          data: {
            path: null,
            publicUrl: localUrl,
            fileName: file.name
          }
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: error.message
        };
      }
    }
  }

  // Delete image
  async deleteImage(filePath) {
    try {
      // Check if Supabase is properly configured
      const isSupabaseConfigured = !(
        supabase.supabaseUrl.includes('your-project') || 
        supabase.supabaseUrl === 'https://<PROJECT-ID>.supabase.co'
      );

      if (!isSupabaseConfigured || !filePath) {
        console.log('Supabase not configured or no file path, skipping deletion');
        return { success: true };
      }

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get image URL
  getImageUrl(filePath) {
    // Check if Supabase is properly configured
    const isSupabaseConfigured = !(
      supabase.supabaseUrl.includes('your-project') || 
      supabase.supabaseUrl === 'https://<PROJECT-ID>.supabase.co'
    );

    if (!isSupabaseConfigured || !filePath) {
      return null;
    }
    
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
}

export const storageService = new SupabaseStorageService();
export default storageService;