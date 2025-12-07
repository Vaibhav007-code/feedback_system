import { NextRequest, NextResponse } from 'next/server';
import { getFeedbackById, updateFeedback, deleteFeedback } from '@/lib/store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single feedback
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const feedback = getFeedbackById(id);

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// PUT - Update feedback
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { edit_token, name, room_number, feedback } = body;

    if (!edit_token) {
      return NextResponse.json(
        { error: 'Edit token is required' },
        { status: 401 }
      );
    }

    if (!name || !room_number || !feedback) {
      return NextResponse.json(
        { error: 'Name, room number, and feedback are required' },
        { status: 400 }
      );
    }

    const updatedFeedback = updateFeedback(
      id,
      edit_token,
      name.trim(),
      room_number.trim(),
      feedback.trim()
    );

    if (!updatedFeedback) {
      return NextResponse.json(
        { error: 'Feedback not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}

// DELETE - Delete feedback
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { edit_token } = body;

    if (!edit_token) {
      return NextResponse.json(
        { error: 'Edit token is required' },
        { status: 401 }
      );
    }

    const deleted = deleteFeedback(id, edit_token);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Feedback not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}