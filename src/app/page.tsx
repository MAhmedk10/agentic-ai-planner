'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import jsPDF from 'jspdf';

export default function Home() {
  const { data: session } = useSession();
  const [planText, setPlanText] = useState('');

  const downloadPDF = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(planText, 180);
    doc.text(lines, 10, 10);
    doc.save("learning_plan.pdf");
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-indigo-600">🧠 Personal AI Planner</h1>

        {session ? (
          <>
            <h2 className="text-lg text-gray-700 text-center">
              Welcome, <span className="font-semibold">{session.user?.name}</span>!
            </h2>
            <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded w-full"
            >
              🔒 Sign out
            </button>

            {/* 🧠 AI Planner Form */}
            <form
              className="space-y-4 mt-4"
              onSubmit={async (e) => {
                e.preventDefault();
                console.log("Form submitted");
                const formData = new FormData(e.currentTarget);
                const accessToken = session?.accessToken;

                const response = await fetch('/api/generateplan/', {
                  method: 'POST',
                  body: JSON.stringify({
                    goal: formData.get('goal'),
                    weeks: Number(formData.get('weeks')),
                    hoursPerDay: Number(formData.get('hoursPerDay')),
                    startDate: formData.get('startDate'),
                    timeOfDay: formData.get('timeOfDay'),
                    skipWeekends: formData.get('skipWeekends') === 'on',
                    preferVideo: formData.get('preferVideo') === 'on',
                    accessToken,
                  }),
                  headers: { 'Content-Type': 'application/json' },
                });

                const result = await response.json();
                setPlanText(result.planText);
                alert("✅ Plan created and added to calendar!");
                console.log(result.planText);
              }}
            >
              <input name="goal" placeholder="Learning Goal" className="w-full border p-2 rounded" required />
              <input name="weeks" type="number" min="1" max="12" className="w-full border p-2 rounded" placeholder="Number of weeks" required />
              <input name="hoursPerDay" type="number" min="1" max="6" className="w-full border p-2 rounded" placeholder="Hours per day" required />
              <input name="startDate" type="date" className="w-full border p-2 rounded" required />
              <input name="timeOfDay" type="time" className="w-full border p-2 rounded" required />

              <label className="flex items-center gap-2">
                <input type="checkbox" name="skipWeekends" />
                Skip weekends
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="preferVideo" />
                Prefer video resources
              </label>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
                🚀 Generate Learning Plan
              </button>
            </form>

            {/* 📘 Display Plan */}
            {planText && (
              <div className="mt-6 p-4 bg-gray-100 rounded border border-gray-300">
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">📘 Your AI-Powered Learning Plan</h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-800">{planText}</pre>

                <button
                  onClick={downloadPDF}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
                >
                  📄 Download Plan as PDF
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-gray-700 text-center">You're not signed in</p>
            <button
              onClick={() => signIn('google')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
            >
              🔐 Sign in with Google
            </button>
          </>
        )}
      </div>
    </main>
  );
}
