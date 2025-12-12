import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, campaign_id } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email address is required' },
        { status: 400 }
      );
    }

    // Call the backend API to handle unsubscribe
    const backendResponse = await fetch('https://api.leadsite.ai/api/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        campaign_id,
        reason: 'unsubscribed'
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to unsubscribe' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
      data
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');
  const campaignId = searchParams.get('campaign_id');

  if (!email) {
    return NextResponse.json(
      { success: false, message: 'Email parameter is required' },
      { status: 400 }
    );
  }

  // For GET requests, redirect to the unsubscribe page with parameters
  const redirectUrl = new URL('/unsubscribe', request.url);
  redirectUrl.searchParams.set('email', email);
  if (campaignId) {
    redirectUrl.searchParams.set('campaign_id', campaignId);
  }

  return NextResponse.redirect(redirectUrl);
}
