import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'C2V space — code that becomes video';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f7f6fa 0%, #edeaf7 55%, #e7f6f2 100%)',
        }}
      >
        <div
          style={{
            width: '108px',
            height: '108px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #2dd4bf 100%)',
            borderRadius: '28px',
            marginBottom: '36px',
          }}
        >
          <svg width="54" height="54" viewBox="0 0 64 64">
            <polygon points="25,17 50,32 25,47" fill="#ffffff" />
          </svg>
        </div>
        <div style={{ display: 'flex', fontSize: '88px', fontWeight: 700, color: '#16161d', letterSpacing: '-2px' }}>
          C2V space
        </div>
        <div style={{ display: 'flex', fontSize: '34px', color: 'rgba(22,22,29,0.62)', marginTop: '18px' }}>
          Write code. The compiler films it.
        </div>
        <div style={{ display: 'flex', gap: '14px', marginTop: '44px' }}>
          {['SceneLang', 'StyleKit', 'Learner', 'Marketplace'].map((chip) => (
            <div
              key={chip}
              style={{
                display: 'flex',
                padding: '10px 26px',
                fontSize: '24px',
                color: '#5b21b6',
                background: '#ffffff',
                border: '2px solid #ddd6fe',
                borderRadius: '999px',
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
