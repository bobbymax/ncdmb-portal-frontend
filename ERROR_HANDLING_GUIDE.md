# Advanced Error Handling System

## 📚 Overview

This application now uses a sophisticated, multi-layered error handling system that provides:

- ✅ **Centralized error logging and tracking**
- ✅ **Typed error classes** for different scenarios
- ✅ **Automatic retry mechanisms** with exponential backoff
- ✅ **Network status monitoring** with offline detection
- ✅ **Enhanced error boundaries** with recovery options
- ✅ **User-friendly error messages** based on error type
- ✅ **Validation error display components**
- ✅ **Performance monitoring** for slow API calls

---

## 🏗️ Architecture

### **Layer 1: Axios Interceptors** (`app/init.ts`)

- Automatically logs all API errors
- Creates typed errors from axios responses
- Monitors request performance
- Handles authentication errors globally

### **Layer 2: Error Service** (`app/Services/ErrorService.ts`)

- Centralized error logging
- Error categorization (Network, Validation, Auth, Server, etc.)
- Severity determination (Low, Medium, High, Critical)
- User notification management
- External logging integration (Sentry, LogRocket)

### **Layer 3: Typed Errors** (`app/Errors/AppErrors.ts`)

- `NetworkError` - Connection failures
- `AuthenticationError` - 401 errors
- `AuthorizationError` - 403 errors
- `ValidationError` - 422 errors with field-level details
- `ServerError` - 5xx errors
- `NotFoundError` - 404 errors
- `TimeoutError` - Request timeouts
- `RateLimitError` - 429 errors

### **Layer 4: React Context** (`app/Context/ErrorContext.tsx`)

- Global error state management
- Error history tracking
- Error filtering by severity/category
- Centralized `handleError` function

### **Layer 5: Error Boundaries** (`app/Boundaries/EnhancedErrorBoundary.tsx`)

- Catches React rendering errors
- Provides reset and reload options
- Logs errors to ErrorService
- Shows detailed error info in development

### **Layer 6: Hooks**

- `useErrorRecovery` - Automatic retry with backoff
- `useNetworkStatus` - Online/offline detection
- `useErrors` - Access global error state

### **Layer 7: UI Components** (`app/Components/ValidationErrors.tsx`)

- `<ValidationErrors />` - Display validation errors
- `<FieldError />` - Inline field-level errors

---

## 🚀 Usage Examples

### **1. Basic Error Handling in Components**

```typescript
import { useErrors } from "app/Context/ErrorContext";

const MyComponent = () => {
  const { handleError } = useErrors();

  const fetchData = async () => {
    try {
      const response = await api.get("/api/data");
      return response.data;
    } catch (error) {
      handleError(error, {
        component: "MyComponent",
        action: "fetchData",
      });
    }
  };
};
```

### **2. Using Error Recovery with Retry**

```typescript
import { useErrorRecovery } from "app/Hooks/useErrorRecovery";

const MyComponent = () => {
  const { executeWithRetry, isRetrying } = useErrorRecovery();

  const saveData = async () => {
    await executeWithRetry(() => api.post("/api/save", data), {
      maxAttempts: 3,
      backoffMs: 1000,
      onRetry: (attempt) => console.log(`Retry attempt ${attempt}`),
      onSuccess: () => toast.success("Saved successfully!"),
    });
  };

  return (
    <button disabled={isRetrying} onClick={saveData}>
      {isRetrying ? "Retrying..." : "Save"}
    </button>
  );
};
```

### **3. Wrapping Components with Error Boundary**

```typescript
import { EnhancedErrorBoundary } from "app/Boundaries/EnhancedErrorBoundary";

const App = () => (
  <EnhancedErrorBoundary
    componentName="Dashboard"
    onError={(error, info) => console.log("Dashboard error:", error)}
  >
    <Dashboard />
  </EnhancedErrorBoundary>
);
```

### **4. Displaying Validation Errors**

```typescript
import ValidationErrors, { FieldError } from "app/Components/ValidationErrors";
import { ValidationError } from "app/Errors/AppErrors";

const MyForm = () => {
  const [validationErrors, setValidationErrors] = useState({});

  const handleSubmit = async () => {
    try {
      await api.post("/api/submit", formData);
    } catch (error) {
      if (error instanceof ValidationError) {
        setValidationErrors(error.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ValidationErrors errors={validationErrors} />

      <input name="email" />
      <FieldError error={validationErrors.email?.[0]} />

      <button>Submit</button>
    </form>
  );
};
```

### **5. Network Status Monitoring**

Network status is automatically monitored at the app level. Users will see:

- ✅ Toast when going offline: "No internet connection"
- ✅ Toast when connection restored: "Connection restored"

### **6. Silent Error Handling**

```typescript
// Don't show toast/alert, just log
handleError(error, { component: "Background Task" }, { silent: true });
```

### **7. Custom Error Notifications**

```typescript
// Show SweetAlert instead of toast for critical errors
handleError(
  error,
  { component: "Payment" },
  {
    showToast: false,
    showAlert: true,
  }
);
```

---

## 📊 Error Categorization

Errors are automatically categorized:

| Status Code | Category       | Severity | User Message               | Retryable |
| ----------- | -------------- | -------- | -------------------------- | --------- |
| No response | Network        | High     | "Unable to connect..."     | ✅ Yes    |
| Timeout     | Network        | High     | "Request took too long..." | ✅ Yes    |
| 401         | Authentication | Critical | "Session expired..."       | ❌ No     |
| 403         | Authorization  | High     | "No permission..."         | ❌ No     |
| 404         | Client         | Medium   | "Resource not found..."    | ❌ No     |
| 422         | Validation     | Medium   | "Validation failed..."     | ❌ No     |
| 429         | Client         | High     | "Too many requests..."     | ✅ Yes    |
| 500-504     | Server         | Critical | "Server error..."          | ✅ Yes    |

---

## 🎯 Automatic Behaviors

### **Retry Strategy:**

- Network errors: Auto-retry 3 times
- Server errors (5xx): Auto-retry 3 times
- Exponential backoff: 1s, 2s, 4s, 8s (max 10s)
- User sees retry progress in toast

### **User Notifications:**

- **Critical errors:** SweetAlert modal (if `showAlert: true`)
- **High severity:** Prominent toast (5s)
- **Medium/Low:** Standard toast (3s)
- **Validation:** Field-level error display

### **Performance Monitoring:**

- API calls > 1s logged as warnings in development
- Slow requests highlighted in console

---

## 🔧 Configuration

### **Error Log Size:**

Default: 100 errors kept in memory (configurable in `ErrorService.ts`)

### **Retry Configuration:**

- Default attempts: 3
- Default backoff: 1000ms
- Can be customized per request

### **Toast Position:**

- Errors: `top-right`
- Network status: `bottom-right`

---

## 📈 Debugging & Monitoring

### **View Error Log in Console:**

```typescript
import { errorService } from "app/Services/ErrorService";

// Get all errors
console.log(errorService.getErrorLog());

// Get critical errors only
console.log(errorService.getErrorsBySeverity(ErrorSeverity.CRITICAL));

// Export for debugging
console.log(errorService.exportErrors());

// Clear log
errorService.clearLog();
```

### **Development Tools:**

- Error boundaries show full stack traces in dev mode
- Slow API calls automatically logged
- All errors logged to console with context

---

## 🚀 Integration with External Services

### **Sentry Integration (Future):**

Uncomment in `ErrorService.ts`:

```typescript
private sendToExternalLogger(error: AppError): void {
  if (!this.isProduction) return;

  if (window.Sentry) {
    window.Sentry.captureException(error.originalError, {
      level: error.severity,
      tags: {
        category: error.category,
        component: error.context?.component,
      },
      contexts: {
        error: error.context,
      },
    });
  }
}
```

### **Custom Logging Endpoint:**

```typescript
fetch("/api/log-error", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(error),
}).catch(() => {
  // Failed to log - don't throw to avoid infinite loop
});
```

---

## ✅ Migration Checklist

When updating existing components:

1. ✅ Import `useErrors` hook
2. ✅ Replace `try/catch` with `handleError`
3. ✅ Wrap critical components with `EnhancedErrorBoundary`
4. ✅ Use `ValidationErrors` component for forms
5. ✅ Use `executeWithRetry` for critical operations
6. ✅ Remove silent `catch {}` blocks

---

## 🎭 Best Practices

### **DO:**

- ✅ Always log errors with context
- ✅ Provide user-friendly messages
- ✅ Use appropriate error severity
- ✅ Let retryable errors retry automatically
- ✅ Show recovery options to users

### **DON'T:**

- ❌ Catch errors silently without logging
- ❌ Show raw error messages to users
- ❌ Retry non-retryable errors
- ❌ Block UI indefinitely on errors
- ❌ Ignore network status

---

## 📝 Example: Full Error Handling Pattern

```typescript
import { useErrors } from "app/Context/ErrorContext";
import { useErrorRecovery } from "app/Hooks/useErrorRecovery";
import { EnhancedErrorBoundary } from "app/Boundaries/EnhancedErrorBoundary";
import ValidationErrors from "app/Components/ValidationErrors";

const MyComponent = () => {
  const { handleError } = useErrors();
  const { executeWithRetry, isRetrying } = useErrorRecovery();
  const [validationErrors, setValidationErrors] = useState({});

  const saveDocument = async () => {
    try {
      await executeWithRetry(() => documentRepo.store("documents", formData), {
        maxAttempts: 3,
        onSuccess: () => toast.success("Document saved!"),
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        setValidationErrors(error.errors);
      } else {
        handleError(error, {
          component: "MyComponent",
          action: "saveDocument",
        });
      }
    }
  };

  return (
    <EnhancedErrorBoundary componentName="MyComponent">
      <form>
        <ValidationErrors errors={validationErrors} />
        {/* form fields */}
        <button disabled={isRetrying}>
          {isRetrying ? "Saving..." : "Save"}
        </button>
      </form>
    </EnhancedErrorBoundary>
  );
};
```

---

## 🎉 Benefits

1. **Consistent Error Handling** - Same pattern everywhere
2. **Better User Experience** - Clear messages and recovery options
3. **Easier Debugging** - Centralized logging with full context
4. **Production Ready** - Integration with Sentry/LogRocket
5. **Network Resilience** - Auto-retry and offline detection
6. **Developer Friendly** - Detailed errors in development
7. **Type Safe** - TypeScript-first error classes

---

**For Questions:** Check the code comments in each file or refer to this guide.
