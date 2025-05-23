'use client';
import React, { useEffect, useState } from 'react';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  // Use this pattern to prevent hydration errors when code behaves differently on client vs server
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return <>{mounted ? children : null}</>;
}