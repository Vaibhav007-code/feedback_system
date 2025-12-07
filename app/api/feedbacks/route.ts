import { NextRequest, NextResponse } from 'next/server';
import { getAllFeedbacks, createFeedback } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET all feedbacks
export async function GET() {
  try {
    const feedbacks = await getAllFeedbacks();
    return NextResponse.json(feedbacks, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('GET /api/feedbacks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks' },
      { status: 500 }
    );
  }
}

// POST new feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, room_number, feedback } = body;

    if (!name?.trim() || !room_number?.trim() || !feedback?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const newFeedback = await createFeedback(
      name.trim(),
      room_number.trim(),
      feedback.trim()
    );

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    console.error('POST /api/feedbacks error:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}