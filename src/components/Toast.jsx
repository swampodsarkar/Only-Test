import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(15, 11, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          color: '#f8fafc',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '14px 20px',
          fontSize: '13px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#0f0b1a',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#0f0b1a',
          },
        },
      }}
    />
  );
}
