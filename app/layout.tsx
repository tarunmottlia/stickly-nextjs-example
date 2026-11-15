export const metadata = { title: 'Stickly + Next.js + Auth.js example' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '48px auto', padding: '0 16px' }}>
        {children}
      </body>
    </html>
  );
}
