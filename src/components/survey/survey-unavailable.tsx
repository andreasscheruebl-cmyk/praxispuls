export function SurveyUnavailable() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-xl font-semibold">Nicht verfügbar</h2>
        <p className="text-muted-foreground">
          Diese Umfrage ist derzeit nicht verfügbar.
        </p>
      </div>
    </div>
  );
}
