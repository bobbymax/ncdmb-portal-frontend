/**
 * Environment Configuration
 * Centralized environment variables with fallbacks
 */
export const ENV = {
  // Security Configuration
  ENCRYPTION_KEY: process.env.REACT_APP_ENCRYPTION_KEY || "ncdmb-staff-user",
  ENCRYPTION_IV: process.env.REACT_APP_ENCRYPTION_IV || "1234567890123456",

  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000",

  // Application Configuration
  NODE_ENV: process.env.NODE_ENV || "development",

  // Performance Configuration
  CACHE_TTL: parseInt(process.env.REACT_APP_CACHE_TTL || "300000"), // 5 minutes
  BATCH_DELAY: parseInt(process.env.REACT_APP_BATCH_DELAY || "100"), // 100ms
  MAX_BATCH_SIZE: parseInt(process.env.REACT_APP_MAX_BATCH_SIZE || "8"),

  // Feature Flags
  ENABLE_PERFORMANCE_MONITORING:
    process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === "true",
  ENABLE_SMART_PRELOADING:
    process.env.REACT_APP_ENABLE_SMART_PRELOADING === "true",
  ENABLE_REQUEST_DEDUPLICATION:
    process.env.REACT_APP_ENABLE_REQUEST_DEDUPLICATION === "true",
};

// Type-safe environment validation
export const validateEnvironment = () => {
  const requiredVars = ["REACT_APP_ENCRYPTION_KEY", "REACT_APP_ENCRYPTION_IV"];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0 && ENV.NODE_ENV === "production") {
    console.warn(`Missing environment variables: ${missing.join(", ")}`);
  }

  return missing.length === 0;
};

// Initialize validation
validateEnvironment();
