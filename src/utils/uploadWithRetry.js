// =============================================
// FILE: src/utils/uploadWithRetry.js
// Cloudinary upload with exponential backoff retry logic
// =============================================

/**
 * Upload file to Cloudinary with retry logic
 * @param {File} file - File to upload
 * @param {string} uploadPreset - Cloudinary upload preset
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @param {Function} onProgress - Progress callback (progress: 0-100)
 * @returns {Promise<Object>} Upload result with URL
 */
export async function uploadWithRetry(
  file,
  uploadPreset,
  maxRetries = 3,
  onProgress = null
) {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  // Validate inputs
  if (!file) {
    throw new Error('File is required');
  }

  if (!CLOUD_NAME) {
    throw new Error('Cloudinary cloud name not configured');
  }

  if (!uploadPreset) {
    throw new Error('Upload preset is required');
  }

  let lastError = null;

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt + 1}/${maxRetries + 1}...`);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      // Upload with progress tracking
      const result = await uploadWithProgress(uploadUrl, formData, onProgress);

      console.log('✅ Upload successful:', result.secure_url);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`❌ Upload attempt ${attempt + 1} failed:`, error.message);

      // Don't retry on final attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate exponential backoff delay
      const delay = calculateBackoffDelay(attempt);
      console.log(`⏳ Retrying in ${delay}ms...`);

      // Wait before retry
      await sleep(delay);
    }
  }

  // All retries failed
  throw new Error(
    `Upload failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Upload with progress tracking
 * @param {string} url - Upload URL
 * @param {FormData} formData - Form data to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Upload result
 */
function uploadWithProgress(url, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (error) {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timeout'));
    });

    // Configure and send request
    xhr.open('POST', url);
    xhr.timeout = 60000; // 60s timeout
    xhr.send(formData);
  });
}

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Attempt number (0-indexed)
 * @returns {number} Delay in milliseconds
 */
function calculateBackoffDelay(attempt) {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

  // Add random jitter (±20%)
  const jitter = delay * 0.2 * (Math.random() - 0.5);

  return Math.round(delay + jitter);
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateFile(file, options = {}) {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;

  const errors = [];

  // Check if file exists
  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    errors.push(
      `File too large (${sizeMB.toFixed(1)} MB). Maximum: ${maxSizeMB} MB`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    sizeMB,
    type: file.type,
  };
}

export default uploadWithRetry;
