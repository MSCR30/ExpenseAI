/**
 * Firebase error message formatter
 * Converts Firebase error codes to user-friendly messages
 */

export const formatFirebaseError = (error: any): string => {
  const code = error?.code || error?.message || "";

  const errorMap: Record<string, string> = {
    // Email/Password errors
    "auth/invalid-email": "Invalid email address",
    "auth/user-disabled": "This account has been disabled",
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/email-already-in-use": "An account already exists with this email",
    "auth/weak-password": "Password is too weak (minimum 6 characters)",
    "auth/operation-not-allowed": "Email/password sign-up is not enabled",

    // Network errors
    "auth/network-request-failed": "Network error. Please check your connection",
    "auth/too-many-requests": "Too many login attempts. Please try again later",

    // Google/OAuth errors
    "auth/account-exists-with-different-credential": "An account already exists with this email but different sign-in method",
    "auth/credential-already-in-use": "This credential is already in use",
    "auth/popup-closed-by-user": "Sign-in popup was closed",
    "auth/cancelled-popup-request": "Sign-in was cancelled",

    // Other common errors
    "auth/invalid-credential": "Invalid credentials",
    "auth/invalid-api-key": "Invalid Firebase configuration",
    "auth/app-not-authorized": "App is not authorized to use Firebase auth",
  };

  return errorMap[code] || (typeof error === "string" ? error : "An error occurred. Please try again");
};
