"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";

interface BarcodeDetectorResult {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect(source: CanvasImageSource): Promise<BarcodeDetectorResult[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats: string[] }): BarcodeDetectorInstance;
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export function QrCameraScanner({ onDetect, active }: { onDetect: (value: string) => void; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const supported = typeof window !== "undefined" && Boolean(window.BarcodeDetector);

  useEffect(() => {
    if (!active || !supported || !window.BarcodeDetector) return;

    let stream: MediaStream | null = null;
    let rafId: number;
    let stopped = false;
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        scan();
      } catch {
        setError("Impossible d'accéder à la caméra. Utilisez la saisie manuelle.");
      }
    }

    async function scan() {
      if (stopped || !videoRef.current) return;
      try {
        const results = await detector.detect(videoRef.current);
        if (results.length > 0) {
          onDetect(results[0].rawValue);
          return;
        }
      } catch {
        // ignore transient detection errors
      }
      rafId = requestAnimationFrame(scan);
    }

    start();

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!supported) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-center text-sm text-muted-foreground">
        <CameraOff className="size-6" />
        Scanner caméra non supporté par ce navigateur.
        <br />
        Utilisez la saisie manuelle ci-dessous.
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-black">
      <video ref={videoRef} muted playsInline className="size-full object-cover" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-40 rounded-2xl border-2 border-primary/70" />
      </div>
      {error && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-destructive/90 px-3 py-2 text-xs text-white">
          <Camera className="size-3.5" /> {error}
        </div>
      )}
    </div>
  );
}
