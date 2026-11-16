import { ImageResponse } from "next/og";

// Home-screen icon for iPhone/iPad (Safari doesn't use SVG icons there).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fbf6ef",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 64 64">
          <rect x="8" y="26" width="48" height="32" rx="4" fill="#9b1c2a" />
          <rect x="5" y="18" width="54" height="12" rx="3" fill="#b3202f" />
          <rect x="28" y="18" width="8" height="40" fill="#1f6b45" />
          <path d="M32 18c-4-9-15-12-17-6s8 7 17 6z" fill="#c8962e" />
          <path d="M32 18c4-9 15-12 17-6s-8 7-17 6z" fill="#c8962e" />
          <circle cx="32" cy="18" r="4" fill="#e2b456" />
        </svg>
      </div>
    ),
    size,
  );
}
