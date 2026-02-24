import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const pillWidth = 88;
  const pillHeight = 36;
  const pillRadius = 18;
  const strokeWidth = 7;

  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: pillWidth,
            height: pillHeight,
            borderRadius: pillRadius,
            border: `${strokeWidth}px solid white`,
            transform: "rotate(-45deg)",
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: strokeWidth,
              background: "white",
              top: "50%",
              marginTop: -(strokeWidth / 2),
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "50%",
              height: "100%",
              background: "rgba(255,255,255,0.2)",
              borderRadius: `${pillRadius}px 0 0 ${pillRadius}px`,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
