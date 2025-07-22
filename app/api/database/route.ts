import { NextRequest, NextResponse } from 'next/server';

// Real Cloudflare D1 database connection for production
export async function POST(request: NextRequest) {
  try {
    const { query, params = [] } = await request.json();

    // Use Cloudflare D1 REST API for real database connection
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !databaseId || !apiToken) {
      throw new Error('Missing Cloudflare credentials. Please check your environment variables.');
    }

    console.log('Executing D1 query:', query, params);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: query,
          params: params,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`D1 API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`D1 query failed: ${data.errors?.[0]?.message || 'Unknown error'}`);
    }

    return NextResponse.json({
      success: true,
      results: data.result[0]?.results || [],
      meta: data.result[0]?.meta || {}
    });

  } catch (error: unknown) {
    console.error('Database query error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed'
      },
      { status: 500 }
    );
  }
}