import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const size = parseInt(searchParams.get("size") || "192");
  const maskable = searchParams.has("maskable");

  // Maskable icons need ~10% safe zone padding
  const padding = maskable ? Math.round(size * 0.1) : Math.round(size * 0.18);
  const iconSize = size - padding * 2;
  const radius = maskable ? 0 : Math.round(size * 0.22);
  const pillWidth = Math.round(iconSize * 0.55);
  const pillHeight = Math.round(iconSize * 0.24);
  const pillRadius = pillHeight / 2;
  const strokeWidth = Math.round(iconSize * 0.07);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: maskable
            ? "#7C3AED"
            : "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
          borderRadius: radius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Pill icon — two overlapping rounded rectangles at 45° */}
        <div
          style={{
            width: pillWidth,
            height: pillHeight,
            borderRadius: pillRadius,
            border: `${strokeWidth}px solid white`,
            transform: "rotate(-45deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Dividing line across middle */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: strokeWidth,
              background: "white",
              top: "50%",
              marginTop: -strokeWidth / 2,
            }}
          />
          {/* Left half fill */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "50%",
              height: "100%",
              background: "rgba(255,255,255,0.25)",
              borderRadius: `${pillRadius}px 0 0 ${pillRadius}px`,
            }}
          />
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
