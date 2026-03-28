"use client";

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Play } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
import { ShakeElement, ShakeHandle } from "./shake-element";
import { useRef } from "react";
import { toast } from "sonner";

export function VideoIntroduction({
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
  thumbnailUrl = "/pfp/video-intro-thumb.png",
}: {
  videoUrl?: string;
  thumbnailUrl?: string;
}) {
  const buttonRef = useRef<ShakeHandle>(null);

  return (
    <ShakeElement ref={buttonRef} className="w-full border rounded-md">
      <InteractiveHoverButton
        className="rounded-md w-full font-semibold text-sm border-none bg-transparent text-foreground relative overflow-hidden before:absolute before:inset-0 before:-z-20 before:bg-cover before:bg-center before:[background-image:var(--thumb-url)] after:absolute after:inset-0 after:-z-10 after:bg-linear-to-r after:from-card after:via-card/50 after:to-card"
        style={{ '--thumb-url': `url('${thumbnailUrl}')` } as React.CSSProperties}
        startIcon={<Play className="h-4 w-4" />}
        onClick={() => { buttonRef.current?.shake(); toast.info("Coming Soon!") }}
      >
        VIDEO INTRODUCTION
      </InteractiveHoverButton>
    </ShakeElement>
    // <Dialog>
    //   <DialogTrigger asChild>
    // ...
    //   </DialogTrigger>
    //   <DialogContent className="sm:max-w-200 p-0 overflow-hidden bg-black border-none">
    //     <DialogHeader className="sr-only">
    //       <DialogTitle>Video Introduction</DialogTitle>
    //       <DialogDescription>A short video introduction</DialogDescription>
    //     </DialogHeader>
    //     <div className="aspect-video w-full">
    //       <iframe
    //         className="w-full h-full"
    //         src={videoUrl}
    //         title="Video Introduction"
    //         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    //         allowFullScreen
    //       />
    //     </div>
    //   </DialogContent>
    // </Dialog>
  );
}
