import { ImageResponse } from 'next/og';

// Brandowana karta społecznościowa/AI 1200×630 (prawdziwy PNG, nie logo).
export const alt = 'Fizyka Statkiem — kurs maturalny z fizyki online';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px',
          background:
            'linear-gradient(135deg, #070b18 0%, #2c1a7a 55%, #db2777 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, opacity: 0.92 }}>
          Fizyka Statkiem
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 22,
            letterSpacing: '-2px',
          }}
        >
          Kurs maturalny z fizyki online
        </div>
        <div style={{ display: 'flex', fontSize: 36, marginTop: 30, opacity: 0.85 }}>
          Wideo HD · PDF-y · zadania CKE · planer · korepetycje
        </div>
      </div>
    ),
    { ...size }
  );
}
