import { NextResponse } from 'next/server';

interface RequestBody {
  schedule: string;
  weightage: {
    rmp: number;
    boilerGrades: number;
    hecticness: number;
  };
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    
    if (!body.schedule || !body.weightage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual backend API call
    // This is a mock response for now
    const mockScore = 7.5;
    
    return NextResponse.json({ score: mockScore });
  } catch (error) {
    console.error('Error rating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to rate schedule' },
      { status: 500 }
    );
  }
} 