// src/app/api/generate-plan/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const {
      goal,
      weeks,
      hoursPerDay,
      startDate,
      timeOfDay,
      skipWeekends,
      preferVideo,
      accessToken,
    } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const videoNote = preferVideo ? "Only include YouTube or video-based resources." : "";

    const prompt = `
You are a smart AI study planner.

Create a ${weeks}-week learning plan for: "${goal}".
User studies ${hoursPerDay} hour(s)/day. ${videoNote}

Each task should:
- Be specific and fit the time
- Include a resource (YouTube/video/article) with link

Format like:
Day 1: [task]
Resource: [title] - [URL]
`;

    const result = await model.generateContent(prompt);
    const planText = result.response.text();
    console.log("✅ Generated Plan:\n", planText);

    const auth = new google.auth.OAuth2();
    console.log("📦 Access Token received in API:", accessToken);
    auth.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth });

    const lines = planText.split('\n');
    let currentDate = new Date(startDate);
    const [hours, minutes] = timeOfDay.split(':').map(Number);

    for (const line of lines) {
      if (line.toLowerCase().startsWith('day') && line.includes(':')) {
        const task = line.split(':')[1].trim();
    
        if (skipWeekends) {
          while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
    
        const start = new Date(currentDate);
        start.setHours(hours);
        start.setMinutes(minutes);
    
        const end = new Date(start.getTime() + hoursPerDay * 60 * 60 * 1000);
    
        try {
          const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
              summary: task,
              start: { dateTime: start.toISOString(), timeZone: 'Asia/Karachi' },
              end: { dateTime: end.toISOString(), timeZone: 'Asia/Karachi' },
            },
          });
    
          console.log("📅 Event inserted:", response.data.summary);
        } catch (err) {
          console.error("❌ Failed to insert event:", task);
          console.error(err); // log full error
        }
    
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    

    return NextResponse.json({ planText });

  } catch (err) {
    console.error("❌ Error in generate-plan API:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
