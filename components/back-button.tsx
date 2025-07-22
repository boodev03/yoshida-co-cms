"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBack}
      className={className}
    >
      <ChevronLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  );
}
