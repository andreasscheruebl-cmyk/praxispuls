import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PraxisPuls – Patientenfeedback & Google-Bewertungen für Zahnarztpraxen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #2dd4bf 100%)",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            borderRadius: "24px",
            padding: "60px 80px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
            maxWidth: "1000px",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#0f766e",
              marginBottom: "16px",
            }}
          >
            PraxisPuls
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#374151",
              textAlign: "center",
              lineHeight: 1.4,
              maxWidth: "700px",
            }}
          >
            Patientenfeedback sammeln. Google-Bewertungen steigern.
          </div>
          <div
            style={{
              display: "flex",
              gap: "32px",
              marginTop: "40px",
              fontSize: "18px",
              color: "#6b7280",
            }}
          >
            <span>QM-konform</span>
            <span>DSGVO-sicher</span>
            <span>Server in DE</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
