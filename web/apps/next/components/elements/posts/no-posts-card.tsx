'use client';

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sofa } from "lucide-react";

interface NoPostsCardProps {
  className?: string
  variant?: "default" | "minimal" | "bordered"
}

export default function NoPostsCard({
  className,
  variant = "default",
}: NoPostsCardProps) {
  const variantStyles = {
    default: "bg-card border border-border",
    minimal: "bg-transparent border-none shadow-none",
    bordered: "bg-card border-2 border-dashed border-border",
  };

  return (
    <Card className={cn(variantStyles[variant], "overflow-hidden", className)}>
      <CardContent className="p-8 md:p-12">
        <div className="flex flex-col items-center text-center max-w-sm mx-auto">
          <div className="relative mb-6">
            <div className="w-32 h-32 relative">
              <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                        <Sofa className="h-12 w-12 text-muted-foreground z-10" />
                    </div>
                </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2">Nincsenek bejegyzések</h3>
          <p className="text-sm text-muted-foreground mb-6 text-balance">Itt jelennek meg a kurzus közleményei, feladatai és tananyagai.</p>
        </div>
      </CardContent>
    </Card>
  )
}
