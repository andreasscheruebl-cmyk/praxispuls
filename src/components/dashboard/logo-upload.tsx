"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

type LogoUploadProps = {
  currentLogoUrl: string | null;
  onUpload: (url: string) => void;
};

/**
 * Client component for uploading a practice logo.
 * Shows a preview of the current logo or a placeholder icon.
 * Clicking the preview area opens a file picker.
 */
export function LogoUpload({ currentLogoUrl, onUpload }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentLogoUrl
  );

  // Sync preview when parent changes logoUrl (e.g. via logo picker)
  useEffect(() => {
    if (currentLogoUrl) {
      setPreviewUrl(`${currentLogoUrl}?t=${Date.now()}`);
    }
  }, [currentLogoUrl]);

  /** Validate file on the client side before uploading */
  function validateFile(file: File): string | null {
    if (file.size > MAX_FILE_SIZE) {
      return "Datei zu groß. Maximal 2 MB erlaubt.";
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Ungültiger Dateityp. Erlaubt sind: JPEG, PNG, WebP und SVG.";
    }
    return null;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be re-selected
    e.target.value = "";

    // Client-side validation
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/practice/logo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json();
        setError(data.error ?? "Fehler beim Hochladen.");
        return;
      }

      const data: { logoUrl: string } = await res.json();

      // Add cache-busting query param so the browser shows the new image
      const freshUrl = `${data.logoUrl}?t=${Date.now()}`;
      setPreviewUrl(freshUrl);
      onUpload(data.logoUrl);
    } catch {
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {/* Clickable preview area */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary/30 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Logo hochladen"
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={previewUrl}
            alt="Praxis-Logo"
            className="h-full w-full object-contain"
          />
        ) : (
          <ImageIcon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
        )}

        {/* Upload overlay on hover (only when not uploading) */}
        {!uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Upload className="h-4 w-4 text-white" />
          </span>
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP oder SVG. Max. 2 MB.
      </p>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
