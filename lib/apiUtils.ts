/**
 * Utility functions for API endpoints
 */

interface ApiResponseOptions {
  status?: number;
  headers?: Record<string, string>;
  cache?: 'no-store' | 'force-cache' | number; // Cache control options
}

/**
 * Create a standardized API response with proper headers
 * 
 * @param data The response data to send
 * @param options Response configuration options
 * @returns A properly formatted Response object
 */
export function createApiResponse(data: any, options: ApiResponseOptions = {}) {
  const { 
    status = 200, 
    headers = {},
    cache = 'no-store'
  } = options;
  
  // Define cache control header based on options
  let cacheControl = '';
  if (cache === 'no-store') {
    cacheControl = 'no-store, max-age=0';
  } else if (cache === 'force-cache') {
    cacheControl = 'public, max-age=31536000'; // 1 year
  } else if (typeof cache === 'number') {
    cacheControl = `public, max-age=${cache}`;
  }
  
  // Prepare JSON response
  const responseBody = JSON.stringify(data, null, process.env.NODE_ENV === 'development' ? 2 : undefined);
  
  // Create the response with proper headers
  return new Response(responseBody, {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
      ...headers
    }
  });
}

/**
 * Create a successful API response
 */
export function successResponse(data: any, options: ApiResponseOptions = {}) {
  const responseData = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    }
  };
  
  return createApiResponse(responseData, options);
}

/**
 * Create an error API response
 */
export function errorResponse(
  message: string, 
  errorCode: string = 'UNKNOWN_ERROR',
  status: number = 500,
  details?: any
) {
  const responseData = {
    success: false,
    error: {
      message,
      code: errorCode,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    }
  };
  
  return createApiResponse(responseData, { status });
}

/**
 * Handle API errors in a consistent way
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return errorResponse(
      error.message,
      error.name,
      500,
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    );
  }
  
  return errorResponse('An unknown error occurred');
}

/**
 * Parse query parameters with type safety
 */
export function parseQueryParams(url: URL) {
  return {
    getString: (name: string, defaultValue: string = '') => {
      return url.searchParams.get(name) || defaultValue;
    },
    
    getNumber: (name: string, defaultValue: number = 0) => {
      const value = url.searchParams.get(name);
      if (value === null) return defaultValue;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    },
    
    getBoolean: (name: string, defaultValue: boolean = false) => {
      const value = url.searchParams.get(name)?.toLowerCase();
      if (value === null) return defaultValue;
      return value === 'true' || value === '1' || value === 'yes';
    },
    
    getArray: (name: string, defaultValue: string[] = []) => {
      const value = url.searchParams.get(name);
      if (!value) return defaultValue;
      return value.split(',').map(v => v.trim());
    }
  };
}
