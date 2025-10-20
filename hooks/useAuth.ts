
import { useContext } from 'react';
// Correct way to import is to import the context from the provider file.
// However, the provided AuthContext.tsx doesn't export the context directly.
// This is a common pattern, so we'll re-implement the hook as it is in AuthContext.tsx for consistency.

// Re-exporting useAuth from AuthContext.tsx would be the ideal pattern.
// As a standalone file this is technically redundant but matches the user-requested file structure.

import { AuthProvider, useAuth as useAuthFromContext } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication context.
 * This is a convenience hook that forwards to the implementation in AuthContext.
 */
export const useAuth = useAuthFromContext;
