import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('schedule') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual backend API call
    // This is a mock response for now
    const mockSchedule = "CS 101 - Introduction to Programming\nMATH 201 - Calculus I\nENG 101 - English Composition";
    
    return NextResponse.json({ schedule: mockSchedule });
  } catch (error) {
    console.error('Error processing schedule:', error);
    return NextResponse.json(
      { error: 'Failed to process schedule' },
      { status: 500 }
    );
  }
} 