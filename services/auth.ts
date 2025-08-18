import { createDatabaseConnection } from "@/configs/database.config";

export interface User {
  id: number;
  username: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Authenticates a user against the D1 database
 * @param username The username to authenticate
 * @param password The password to check
 * @returns AuthResult with success status and user data or error message
 */
export const authenticateUser = async (username: string, password: string): Promise<AuthResult> => {
  if (!username || !password) {
    return {
      success: false,
      error: 'Username and password are required'
    };
  }

  try {
    const db = await createDatabaseConnection();
    
    const query = `
      SELECT id, username
      FROM users 
      WHERE username = ? AND password = ?
      LIMIT 1
    `;
    
    const result = await db.execute(query, [username.trim(), password]);
    
    // Debug logging to see what we get back
    console.log('Database result:', result);
    console.log('Results array:', result.results);
    
    if (!result || !result.results || result.results.length === 0) {
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }
    
    const user = result.results[0] as any;
    console.log('User data:', user);
    console.log('User ID:', user.id, 'Type:', typeof user.id);
    console.log('User username:', user.username, 'Type:', typeof user.username);
    
    // More flexible validation - check for falsy values but allow 0 as valid ID
    if ((user.id === null || user.id === undefined) || !user.username) {
      console.error('User validation failed - ID:', user.id, 'Username:', user.username);
      return {
        success: false,
        error: 'Invalid user data received'
      };
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username
      }
    };
  } catch (error) {
    // Log the actual error for debugging but don't expose sensitive details
    console.error("Authentication error:", error);
    
    // Return user-friendly error messages without throwing
    if (error instanceof Error) {
      if (error.message.includes('Database query failed')) {
        return {
          success: false,
          error: 'Authentication service is temporarily unavailable'
        };
      }
    }
    
    // Generic fallback error
    return {
      success: false,
      error: 'Authentication failed. Please try again.'
    };
  }
};