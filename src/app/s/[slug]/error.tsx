"use client";

export default function SurveyError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mx-auto max-w-sm text-center">
        <div className="text-4xl">😔</div>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">
          Leider ist ein Fehler aufgetreten
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Die Umfrage konnte nicht geladen werden. Bitte versuchen Sie es in
          einigen Minuten erneut.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
