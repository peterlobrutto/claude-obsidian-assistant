import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 18,
            height: 8,
            borderRadius: 4,
            border: "2.5px solid white",
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
              height: 2.5,
              background: "white",
              top: "50%",
              marginTop: -1.25,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
