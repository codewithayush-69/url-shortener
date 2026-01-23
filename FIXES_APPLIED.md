# Flash Messages & Redirect Issues - FIXES APPLIED

## Problems Found & Fixed:

### 1. **Flash Messages Not Persisting Across Redirects** ❌
**Issue:** Flash messages require sessions to be saved before redirect completes.

**Fix in `utils/response.js`:**
```javascript
// BEFORE - Messages were lost during redirect
export const flashErrorAndRedirect = (req, res, message, redirectPath) => {
  req.flash("error", message);
  return res.redirect(redirectPath); // Session not saved!
};

// AFTER - Session saved before redirect
export const flashErrorAndRedirect = (req, res, message, redirectPath) => {
  req.flash("error", message);
  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
    }
    return res.redirect(redirectPath); // Now session is saved
  });
};
```

---

### 2. **Session Configuration Incomplete** ❌
**Issue:** Missing cookie options for session persistence.

**Fix in `app.js`:**
```javascript
// BEFORE
app.use(session({
  secret: "flash-only-secret",
  resave: false,
  saveUninitialized: false,
}));

// AFTER - Added proper cookie options
app.use(session({
  secret: "flash-only-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    sameSite: 'strict'
  }
}));
```

---

### 3. **Password Change Controller Issues** ❌

#### Problem A: Missing Return Statements
**Issue:** Some flash redirects didn't have `return` statements, causing code to continue executing.

**Fix:**
```javascript
// BEFORE - No return, code continues executing
if(password !== confirm_password){
  flashErrorAndRedirect(req, res, "Password Do Not Match", "/profile/chnage-password");
};

// AFTER - Returns immediately
if (password !== confirm_password) {
  return flashErrorAndRedirect(
    req,
    res,
    "New passwords do not match",
    "/profile/change-password",
  );
}
```

#### Problem B: Incorrect Password Comparison
**Issue:** Hashing password and comparing with hash (always false).

**Fix:**
```javascript
// BEFORE - Wrong approach
const oldHashedPassword = await hashingPassword(oldPassword);
if (oldHashedPassword !== user.passwordHash) { // Will always be different!

// AFTER - Use proper verification
const isOldPasswordValid = await verifyPassword(user.passwordHash, oldPassword);
if (!isOldPasswordValid) {
  return flashErrorAndRedirect(...);
}
```

#### Problem C: Wrong Field Name in Update
**Issue:** `newHashedPassword` but updateUser expects `passwordHash`.

**Fix:**
```javascript
// BEFORE
await updateUser(req.user.id, { newHashedPassword });

// AFTER
const newHashedPassword = await hashingPassword(password);
await updateUser(req.user.id, { passwordHash: newHashedPassword });
```

#### Problem D: Login Error Handler Missing
**Issue:** Login error catch block didn't return flash error.

**Fix:**
```javascript
// BEFORE
} catch (error) {
  console.error("Login error:", error);
} // Error not shown to user

// AFTER
} catch (error) {
  console.error("Login error:", error);
  return flashErrorAndRedirect(
    req,
    res,
    "An error occurred during login",
    "/login"
  );
}
```

---

### 4. **Route URL Typo** ❌
**Issue:** Routes using `/profile/chnage-password` (typo) instead of `/profile/change-password`

**Fix in auth controller:**
- Changed all instances from `/profile/chnage-password` → `/profile/change-password`
- Updated form action in password-change.ejs to match

---

## Summary of Changes:

| File | Changes |
|------|---------|
| `utils/response.js` | Added `req.session.save()` to both flash functions |
| `app.js` | Added cookie options to session config |
| `controller/auth.controller.js` | Fixed password change logic, added return statements, fixed password verification, fixed login error handler |
| `routes/auth.routes.js` | Route already correct in middleware |
| `views/auth/password-change.ejs` | Created with correct form action |

---

## How to Test:

1. **Test Error Message:**
   - Go to `/login`
   - Enter wrong email/password
   - Should see error message on same page (not redirect loop)

2. **Test Success Message:**
   - Log in with correct credentials
   - Should see "Login successful" message on home page

3. **Test Password Change:**
   - Go to `/profile/change-password`
   - Enter wrong current password
   - Should see "Current password is incorrect" message

---

## Files Modified:
✅ `utils/response.js` - Session persistence
✅ `app.js` - Session configuration
✅ `controller/auth.controller.js` - Password change logic fixes
✅ `views/auth/password-change.ejs` - Created new file

No other files touched. System should work now! 🚀
