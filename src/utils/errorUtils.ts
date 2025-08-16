import { toast } from '@/components/ui/use-toast';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  userMessage?: string;
}

export class CustomError extends Error {
  code: string;
  details?: any;
  userMessage?: string;

  constructor(code: string, message: string, details?: any, userMessage?: string) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.details = details;
    this.userMessage = userMessage;
  }
}

// Error codes and their user-friendly messages
export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: {
    code: 'AUTH_REQUIRED',
    userMessage: 'Please log in to continue.',
    severity: 'warning' as const
  },
  AUTH_EXPIRED: {
    code: 'AUTH_EXPIRED',
    userMessage: 'Your session has expired. Please log in again.',
    severity: 'warning' as const
  },
  AUTH_INVALID: {
    code: 'AUTH_INVALID',
    userMessage: 'Invalid credentials. Please check your email and password.',
    severity: 'error' as const
  },

  // Token errors
  INSUFFICIENT_TOKENS: {
    code: 'INSUFFICIENT_TOKENS',
    userMessage: 'You don\'t have enough tokens. Please upgrade your plan or wait for monthly reset.',
    severity: 'warning' as const
  },
  TOKEN_DEDUCTION_FAILED: {
    code: 'TOKEN_DEDUCTION_FAILED',
    userMessage: 'Failed to deduct token. Please try again.',
    severity: 'error' as const
  },

  // AI generation errors
  AI_GENERATION_FAILED: {
    code: 'AI_GENERATION_FAILED',
    userMessage: 'Failed to generate comments. Please try again.',
    severity: 'error' as const
  },
  AI_SERVICE_UNAVAILABLE: {
    code: 'AI_SERVICE_UNAVAILABLE',
    userMessage: 'AI service is temporarily unavailable. Using fallback comments.',
    severity: 'info' as const
  },
  HUGGINGFACE_RATE_LIMIT: {
    code: 'HUGGINGFACE_RATE_LIMIT',
    userMessage: 'AI service rate limit exceeded. Please wait a moment and try again.',
    severity: 'warning' as const
  },

  // Database errors
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    userMessage: 'Database connection issue. Please try again.',
    severity: 'error' as const
  },
  PROFILE_NOT_FOUND: {
    code: 'PROFILE_NOT_FOUND',
    userMessage: 'User profile not found. Please complete onboarding.',
    severity: 'warning' as const
  },

  // Network errors
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    userMessage: 'Network connection issue. Please check your internet connection.',
    severity: 'error' as const
  },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    userMessage: 'Server error occurred. Please try again later.',
    severity: 'error' as const
  },

  // Extension errors
  EXTENSION_NOT_INSTALLED: {
    code: 'EXTENSION_NOT_INSTALLED',
    userMessage: 'Chrome extension not detected. Please install the extension for full functionality.',
    severity: 'info' as const
  },
  LINKEDIN_NOT_DETECTED: {
    code: 'LINKEDIN_NOT_DETECTED',
    userMessage: 'Please navigate to LinkedIn.com to use comment suggestions.',
    severity: 'info' as const
  },
  COMMENT_BOX_NOT_FOUND: {
    code: 'COMMENT_BOX_NOT_FOUND',
    userMessage: 'Comment box not found. Comment copied to clipboard instead.',
    severity: 'info' as const
  },

  // General errors
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    userMessage: 'An unexpected error occurred. Please try again.',
    severity: 'error' as const
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    userMessage: 'Please check your input and try again.',
    severity: 'warning' as const
  }
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

// Error handling utility functions
export const handleError = (error: any, defaultCode: ErrorCode = 'UNKNOWN_ERROR') => {
  console.error('Error occurred:', error);

  let errorInfo = ERROR_CODES[defaultCode];
  let details = error;

  // Handle custom errors
  if (error instanceof CustomError) {
    errorInfo = ERROR_CODES[error.code as ErrorCode] || ERROR_CODES.UNKNOWN_ERROR;
    details = error.details;
  }
  // Handle API response errors
  else if (error?.response) {
    const status = error.response.status;
    
    switch (status) {
      case 401:
        errorInfo = ERROR_CODES.AUTH_REQUIRED;
        break;
      case 402:
        errorInfo = ERROR_CODES.INSUFFICIENT_TOKENS;
        break;
      case 403:
        errorInfo = ERROR_CODES.AUTH_INVALID;
        break;
      case 404:
        errorInfo = ERROR_CODES.PROFILE_NOT_FOUND;
        break;
      case 429:
        errorInfo = ERROR_CODES.HUGGINGFACE_RATE_LIMIT;
        break;
      case 500:
      case 502:
      case 503:
        errorInfo = ERROR_CODES.SERVER_ERROR;
        break;
      default:
        errorInfo = ERROR_CODES.UNKNOWN_ERROR;
    }
  }
  // Handle network errors
  else if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    errorInfo = ERROR_CODES.NETWORK_ERROR;
  }
  // Handle Supabase errors
  else if (error?.code) {
    switch (error.code) {
      case 'PGRST116': // No rows found
        errorInfo = ERROR_CODES.PROFILE_NOT_FOUND;
        break;
      case '42501': // Insufficient privilege
        errorInfo = ERROR_CODES.AUTH_REQUIRED;
        break;
      default:
        errorInfo = ERROR_CODES.DATABASE_ERROR;
    }
  }

  return {
    ...errorInfo,
    originalError: error,
    details
  };
};

// Show error toast with appropriate styling
export const showErrorToast = (error: any, defaultCode: ErrorCode = 'UNKNOWN_ERROR') => {
  const errorInfo = handleError(error, defaultCode);
  
  toast({
    title: getErrorTitle(errorInfo.severity),
    description: errorInfo.userMessage,
    variant: errorInfo.severity === 'error' ? 'destructive' : 'default',
  });

  return errorInfo;
};

// Get appropriate title for error severity
const getErrorTitle = (severity: 'error' | 'warning' | 'info') => {
  switch (severity) {
    case 'error':
      return 'Error';
    case 'warning':
      return 'Warning';
    case 'info':
      return 'Info';
    default:
      return 'Notice';
  }
};

// Retry utility with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        break; // Don't wait after the last attempt
      }

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Async error handler for event handlers
export const asyncErrorHandler = (fn: (...args: any[]) => Promise<any>) => {
  return (...args: any[]) => {
    fn(...args).catch((error) => {
      showErrorToast(error);
    });
  };
};

// Safe JSON parse
export const safeJsonParse = <T = any>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
};

// Check if user is online
export const isOnline = () => navigator.onLine;

// Report error to external service (placeholder for future integration)
export const reportError = (error: any, context?: Record<string, any>) => {
  // In production, integrate with error reporting service like Sentry
  console.error('Error reported:', {
    error: error.message || error,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });

  // Example Sentry integration:
  // Sentry.captureException(error, { extra: context });
};
