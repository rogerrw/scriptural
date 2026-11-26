# 007: Logout usually leaves the person signed in

**Severity:** High
**Area:** `app/header/PrivateHeaderActions.tsx`
**PRD:** None (sign-out is existing behavior)

## Summary

Both **Logout** controls (the user dropdown and the small-screen menu) are a `<Link href="/">` with `onClick={() => startTransition(logout)}`. The click sends the `logout` server action and starts a client navigation to `/`, and the navigation aborts the action request. The session cookie stays, and the person is still signed in. On a shared computer, the next person gets the account.

## Steps

1. Sign in.
2. Open the user menu (top right) and choose **Logout**.
3. Open `/review`.

**Expected:** Step 3 redirects to `/auth/signin`.

**Actual:** In 8 of 10 automated trials, `/review` opened while still signed in. The `authjs.session-token` cookie was still set. The dev server logs `logout()` every time, but the browser shows the action's POST cancelled:

```
FAIL  logout clears session in every trial  -- ["/auth/signin","/review","/review","/auth/signin","/review","/review","/review","/review","/review","/review"]

trial 0: session cookie left=true
  req  POST / action=0090febf
  FAIL GET / net::ERR_ABORTED
  FAIL POST / net::ERR_ABORTED
```

## Cause

The `Link` and the server action race. `logout` already redirects to `/auth/signin`, so the control does not need its own navigation. A `<button>`, or a `Link` whose click handler calls `preventDefault()`, would let the action finish and set its cookie.
