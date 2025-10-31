# Error Handling Migration Guide

## 🎯 Quick Start

### **Before (Old Pattern):**

```typescript
try {
  const response = await api.get("/api/data");
  setData(response.data);
} catch (error) {
  // Error fetching data
}
```

### **After (New Pattern):**

```typescript
import { useErrors } from "app/Context/ErrorContext";

const { handleError } = useErrors();

try {
  const response = await api.get("/api/data");
  setData(response.data);
} catch (error) {
  handleError(error, {
    component: "MyComponent",
    action: "fetchData",
  });
}
```

---

## 📝 Common Patterns

### **1. API Calls with Automatic Retry**

**Old:**

```typescript
const saveDocument = async () => {
  try {
    await documentRepo.store("documents", data);
    toast.success("Saved!");
  } catch (error) {
    toast.error("Failed to save");
  }
};
```

**New:**

```typescript
import { useErrorRecovery } from "app/Hooks/useErrorRecovery";

const { executeWithRetry, isRetrying } = useErrorRecovery();

const saveDocument = async () => {
  await executeWithRetry(() => documentRepo.store("documents", data), {
    maxAttempts: 3,
    onSuccess: () => toast.success("Saved!"),
  });
};

// In JSX:
<button disabled={isRetrying}>{isRetrying ? "Saving..." : "Save"}</button>;
```

---

### **2. Validation Errors**

**Old:**

```typescript
const [errors, setErrors] = useState([]);

try {
  await submit();
} catch (error) {
  if (error.response?.status === 422) {
    setErrors(Object.values(error.response.data.errors).flat());
  }
}

// In JSX:
{
  errors.map((err) => <div className="text-danger">{err}</div>);
}
```

**New:**

```typescript
import ValidationErrors from "app/Components/ValidationErrors";
import { ValidationError } from "app/Errors/AppErrors";

const [validationErrors, setValidationErrors] = useState({});

try {
  await submit();
} catch (error) {
  if (error instanceof ValidationError) {
    setValidationErrors(error.errors);
  }
}

// In JSX:
<ValidationErrors errors={validationErrors} />;
```

---

### **3. Form Field Errors**

**Old:**

```typescript
{
  errors.email && <span className="text-danger">{errors.email}</span>;
}
```

**New:**

```typescript
import { FieldError } from "app/Components/ValidationErrors";

<FieldError error={validationErrors.email?.[0]} />;
```

---

### **4. Error Boundaries**

**Old:**

```typescript
import ErrorBoundary from "resources/views/components/ErrorBoundary";

<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>;
```

**New:**

```typescript
import { EnhancedErrorBoundary } from "app/Boundaries/EnhancedErrorBoundary";

<EnhancedErrorBoundary
  componentName="Dashboard"
  onError={(error, info) => {
    // Custom handling if needed
  }}
  resetKeys={[userId]} // Auto-reset when userId changes
>
  <Dashboard />
</EnhancedErrorBoundary>;
```

---

### **5. Silent Background Operations**

**Old:**

```typescript
try {
  await backgroundTask();
} catch (error) {
  // Silently ignore
}
```

**New:**

```typescript
const { handleError } = useErrors();

try {
  await backgroundTask();
} catch (error) {
  // Log but don't show to user
  handleError(
    error,
    {
      component: "BackgroundTask",
    },
    { silent: true }
  );
}
```

---

## 🔄 Migration Checklist

For each component:

- [ ] Import `useErrors` hook
- [ ] Import error handling utilities as needed
- [ ] Replace silent `catch {}` with `handleError(..., { silent: true })`
- [ ] Replace toast.error with centralized error handling
- [ ] Use `ValidationErrors` component for forms
- [ ] Wrap critical sections with `EnhancedErrorBoundary`
- [ ] Use `executeWithRetry` for important operations
- [ ] Add component and action context to errors

---

## 📊 Priority Order

Migrate in this order for maximum impact:

1. **High Priority Components:**

   - Dashboard ✅ (Already migrated)
   - Login/Authentication
   - Document creation/update forms
   - Payment processing

2. **Medium Priority:**

   - Data fetching hooks (useResourceActions) ✅ (Already migrated)
   - Form submissions
   - File uploads

3. **Low Priority:**
   - Read-only displays
   - Background tasks
   - Analytics tracking

---

## 🧪 Testing After Migration

For each migrated component:

1. **Test normal flow** - Should work as before
2. **Test with network offline** - Should show clear message
3. **Test with invalid data** - Should show validation errors
4. **Test with server error** - Should retry and show appropriate message
5. **Check console** - Should see structured error logs in dev mode

---

## 🎯 Common Scenarios

### **Network Offline:**

✅ Automatic toast: "No internet connection"  
✅ Auto-retry when back online  
✅ Show toast: "Connection restored"

### **Session Expired (401):**

✅ Auto-logout  
✅ Redirect to login  
✅ Clear all auth tokens

### **Validation Failed (422):**

✅ Extract field errors  
✅ Display with `<ValidationErrors />`  
✅ No toast spam

### **Server Error (500):**

✅ Auto-retry 3 times  
✅ Show user-friendly message  
✅ Log full context

### **Not Found (404):**

✅ Clear "not found" message  
✅ No retry (not retryable)  
✅ Suggest navigation

---

## 💡 Tips

- Always provide `component` and `action` context
- Use `silent: true` for non-critical background tasks
- Use `showAlert: true` for critical user-facing errors
- Wrap page-level components with `EnhancedErrorBoundary`
- Check error severity before deciding notification method

---

## 🚀 For Your Presentation

Demonstrate:

1. **Network resilience** - Turn off WiFi, show auto-reconnect
2. **Retry mechanism** - Show automatic retries on server errors
3. **User-friendly messages** - No technical jargon
4. **Validation errors** - Clean field-level display
5. **Error recovery** - "Try Again" buttons that work

---

**Migration is opt-in! Old error handling still works, but new system is available for gradual adoption.**
