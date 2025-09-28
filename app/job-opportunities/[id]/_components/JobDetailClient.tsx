"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function JobDetailClient() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button
      onClick={handleBack}
      variant="outline"
      className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Jobs
    </Button>
  );
}