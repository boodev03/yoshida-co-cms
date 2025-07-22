// Database client for server-side operations
export const createDatabaseConnection = async () => {
  // For API routes, we'll use fetch to communicate with Cloudflare D1
  return {
    execute: async (query: string, params: any[] = []) => {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, params }),
      });
      
      if (!response.ok) {
        throw new Error(`Database query failed: ${response.statusText}`);
      }
      
      return await response.json();
    }
  };
};