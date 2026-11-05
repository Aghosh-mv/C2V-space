import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '180px',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #2dd4bf 100%)',
          borderRadius: '40px',
        }}
      >
        <svg width="86" height="86" viewBox="0 0 64 64">
          <polygon points="25,17 50,32 25,47" fill="#ffffff" />
        </svg>
      </div>
    ),
    size,
  );
}
