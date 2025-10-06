"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ApplicationDetailClient() {
  const router = useRouter();

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        className="text-white/70 hover:text-white hover:bg-white/10"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Applications
      </Button>
    </div>
  );
}
