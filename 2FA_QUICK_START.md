# 2FA Quick Start - Frontend Integration

## 🚀 Ready to Use Components

You now have two ready-to-use React components for 2FA:

1. **TwoFactorSetup** - For users to enable 2FA
2. **TwoFactorChallenge** - For login verification

---

## 📍 File Locations

```
/Users/bobbyekaro/React/ncdmb/src/resources/views/components/Auth/
├── TwoFactorSetup.tsx
└── TwoFactorChallenge.tsx
```

---

## 💡 Quick Integration Examples

### Example 1: Add to User Settings/Profile Page

```tsx
// In your UserSettings.tsx or ProfilePage.tsx

import TwoFactorSetup from "resources/views/components/Auth/TwoFactorSetup";
import { useState, useEffect } from "react";
import axios from "axios";

const UserSettings = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check 2FA status
    axios
      .get("/api/2fa/status")
      .then((res) => setTwoFactorEnabled(res.data.enabled))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="settings-page">
      <h2>Security Settings</h2>

      <div className="card mb-4">
        <div className="card-header">
          <h5>Two-Factor Authentication</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : twoFactorEnabled ? (
            <div>
              <p className="text-success">
                <i className="ri-checkbox-circle-fill me-2"></i>
                2FA is enabled on your account
              </p>
              <button className="btn btn-danger" onClick={/* disable logic */}>
                Disable 2FA
              </button>
            </div>
          ) : (
            <TwoFactorSetup />
          )}
        </div>
      </div>
    </div>
  );
};
```

### Example 2: Update Login Flow

```tsx
// In your Login.tsx component

import { useState } from "react";
import TwoFactorChallenge from "resources/views/components/Auth/TwoFactorChallenge";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/login", {
        username,
        password,
      });

      // Check if 2FA is required
      if (response.data.requires_2fa) {
        setRequires2FA(true);
        setUserId(response.data.user_id);
      } else {
        // Normal login - redirect to dashboard
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // If 2FA is required, show the challenge
  if (requires2FA) {
    return (
      <TwoFactorChallenge
        userId={userId}
        onSuccess={() => {
          // Login successful after 2FA
          window.location.href = "/dashboard";
        }}
        onCancel={() => {
          // User wants to go back to login
          setRequires2FA(false);
          setUserId(0);
          setPassword(""); // Clear password
        }}
      />
    );
  }

  // Normal login form
  return (
    <div className="login-page">
      <form onSubmit={handleLogin}>
        <h2>Login to NCDMB Portal</h2>

        <div className="mb-3">
          <label>Staff Number or Email</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};
```

---

## 🎨 Component Props

### TwoFactorSetup

No props required! It's a complete standalone component.

```tsx
<TwoFactorSetup />
```

### TwoFactorChallenge

```tsx
<TwoFactorChallenge
  userId={number}           // Required: User ID from login response
  onSuccess={() => void}    // Required: Called after successful verification
  onCancel={() => void}     // Optional: Called when user clicks cancel
/>
```

---

## 🔌 API Endpoints Used

The components automatically call these endpoints:

### TwoFactorSetup Component:

- `POST /api/2fa/generate` - Generate QR code
- `POST /api/2fa/confirm` - Verify and enable 2FA

### TwoFactorChallenge Component:

- `POST /api/2fa/verify` - Verify 2FA code during login

### Status Check:

- `GET /api/2fa/status` - Check if 2FA is enabled

---

## ✨ Features Included

### TwoFactorSetup:

- ✅ Step-by-step wizard UI
- ✅ QR code generation and display
- ✅ Manual key entry option
- ✅ Code verification
- ✅ Recovery codes generation
- ✅ Copy-to-clipboard for recovery codes
- ✅ Microsoft Authenticator branding
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling

### TwoFactorChallenge:

- ✅ Clean, modern UI
- ✅ Auto-focus on input
- ✅ Enter key support
- ✅ Recovery code option
- ✅ Loading states
- ✅ Error messages
- ✅ Cancel option
- ✅ Helpful instructions
- ✅ Responsive design

---

## 🎨 Styling

Components use Bootstrap classes and your project's color scheme (#137547).

No additional CSS files needed - they work with your existing Bootstrap setup!

---

## 🧪 Testing Checklist

- [ ] Run migration: `php artisan migrate`
- [ ] Add TwoFactorSetup to a settings page
- [ ] Test QR code generation
- [ ] Scan QR code with Microsoft Authenticator
- [ ] Verify code works
- [ ] Save recovery codes
- [ ] Update login to show TwoFactorChallenge
- [ ] Test login with 2FA enabled
- [ ] Test recovery code login
- [ ] Test canceling 2FA challenge

---

## 📞 Need Help?

Check the main guide: `/Users/bobbyekaro/Sites/portal/2FA_IMPLEMENTATION_GUIDE.md`

---

Happy coding! 🎉
