'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/queryClient';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState<QueryClient>(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* ThemeProvider는 여기에 추가 */}
      {children}
    </QueryClientProvider>
  );
}
