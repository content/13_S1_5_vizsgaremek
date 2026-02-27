"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Maximize2, Move, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageCropperProps {
  src: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aspectRatio?: number;
  minCropSize?: number;
  title?: string;
  description?: string;
  onCropComplete: (croppedImageDataUri: string) => void;
  outputFormat?: "image/png" | "image/jpeg" | "image/webp";
  outputQuality?: number;
}

type HandleId = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCursorForHandle(handle: HandleId): string {
  const map: Record<HandleId, string> = {
    nw: "nwse-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    se: "nwse-resize",
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
  };
  return map[handle];
}

export function ImageCropper({
  src,
  open,
  onOpenChange,
  aspectRatio,
  minCropSize = 48,
  title = "Kép módosítása",
  description = "",
  onCropComplete,
  outputFormat = "image/png",
  outputQuality = 0.92,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });

  const [baseSize, setBaseSize] = useState({ w: 0, h: 0 });

  const [zoom, setZoom] = useState(1);

  const [pan, setPan] = useState({ x: 0, y: 0 });

  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });

  const [dragging, setDragging] = useState<"move-crop" | "pan-image" | HandleId | null>(null);
  const dragStart = useRef({
    mx: 0,
    my: 0,
    crop: { x: 0, y: 0, width: 0, height: 0 },
    pan: { x: 0, y: 0 },
  });

  const locked = aspectRatio !== undefined;

  const imgDisplayW = baseSize.w * zoom;
  const imgDisplayH = baseSize.h * zoom;

  useEffect(() => {
    if (!src || !open) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      imageRef.current = img;
      setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };

    img.src = src;
  }, [src, open]);

  useEffect(() => {
    if (!containerRef.current || imgNatural.w === 0) return;

    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const scale = Math.min(cw / imgNatural.w, ch / imgNatural.h);

    setBaseSize({ w: imgNatural.w * scale, h: imgNatural.h * scale });
  }, [imgNatural]);

  useEffect(() => {
    if (baseSize.w === 0 || baseSize.h === 0 || !containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;

    let cropW: number;
    let cropH: number;

    if (locked && aspectRatio) {
      if (baseSize.w / baseSize.h > aspectRatio) {
        cropH = baseSize.h * 0.75;
        cropW = cropH * aspectRatio;
      } else {
        cropW = baseSize.w * 0.75;
        cropH = cropW / aspectRatio;
      }
    } else {
      cropW = baseSize.w * 0.75;
      cropH = baseSize.h * 0.75;
    }

    setCrop({
      x: (cw - cropW) / 2,
      y: (ch - cropH) / 2,
      width: cropW,
      height: cropH,
    });
  }, [baseSize, locked, aspectRatio]);

  const clampPan = useCallback(
    (px: number, py: number): { x: number; y: number } => {
      if (!containerRef.current) return { x: px, y: py };
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;

      const imgBaseX = (cw - imgDisplayW) / 2;
      const imgBaseY = (ch - imgDisplayH) / 2;

      const minPx = crop.x + crop.width - imgBaseX - imgDisplayW;
      const maxPx = crop.x - imgBaseX;
      const minPy = crop.y + crop.height - imgBaseY - imgDisplayH;
      const maxPy = crop.y - imgBaseY;

      return {
        x: clamp(px, Math.min(minPx, maxPx), Math.max(minPx, maxPx)),
        y: clamp(py, Math.min(minPy, maxPy), Math.max(minPy, maxPy)),
      };
    },
    [imgDisplayW, imgDisplayH, crop]
  );

  useEffect(() => {
    setPan((p) => clampPan(p.x, p.y));
  }, [clampPan]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imageRef.current) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const dpr = window.devicePixelRatio;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const imgX = (cw - imgDisplayW) / 2 + pan.x;
    const imgY = (ch - imgDisplayH) / 2 + pan.y;

    ctx.fillStyle = "hsl(0 0% 8%)";
    ctx.fillRect(0, 0, cw, ch);

    ctx.drawImage(imageRef.current, imgX, imgY, imgDisplayW, imgDisplayH);

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, cw, ch);

    ctx.save();
    ctx.beginPath();
    ctx.rect(crop.x, crop.y, crop.width, crop.height);
    ctx.clip();

    ctx.drawImage(imageRef.current, imgX, imgY, imgDisplayW, imgDisplayH);
    ctx.restore();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= 2; i++) {
      const vx = crop.x + (crop.width / 3) * i;
      ctx.beginPath();
      ctx.moveTo(vx, crop.y);
      ctx.lineTo(vx, crop.y + crop.height);
      ctx.stroke();
      const hy = crop.y + (crop.height / 3) * i;
      ctx.beginPath();
      ctx.moveTo(crop.x, hy);
      ctx.lineTo(crop.x + crop.width, hy);
      ctx.stroke();
    }

    const handleLen = 16;
    const handleThick = 3;
    ctx.strokeStyle = "white";
    ctx.lineWidth = handleThick;
    ctx.lineCap = "square";

    const corners = [
      { x: crop.x, y: crop.y, dx: 1, dy: 1 },
      { x: crop.x + crop.width, y: crop.y, dx: -1, dy: 1 },
      { x: crop.x, y: crop.y + crop.height, dx: 1, dy: -1 },
      { x: crop.x + crop.width, y: crop.y + crop.height, dx: -1, dy: -1 },
    ];

    for (const c of corners) {
      ctx.beginPath();
      ctx.moveTo(c.x + c.dx * handleLen, c.y);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x, c.y + c.dy * handleLen);
      ctx.stroke();
    }

    if (!locked) {
      const midHandleLen = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(crop.x + crop.width / 2 - midHandleLen, crop.y);
      ctx.lineTo(crop.x + crop.width / 2 + midHandleLen, crop.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crop.x + crop.width / 2 - midHandleLen, crop.y + crop.height);
      ctx.lineTo(crop.x + crop.width / 2 + midHandleLen, crop.y + crop.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crop.x, crop.y + crop.height / 2 - midHandleLen);
      ctx.lineTo(crop.x, crop.y + crop.height / 2 + midHandleLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crop.x + crop.width, crop.y + crop.height / 2 - midHandleLen);
      ctx.lineTo(crop.x + crop.width, crop.y + crop.height / 2 + midHandleLen);
      ctx.stroke();
    }
  }, [crop, imgDisplayW, imgDisplayH, pan, locked]);

  useEffect(() => {
    const id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [draw]);

  const hitTest = useCallback(
    (mx: number, my: number): "move-crop" | "pan-image" | HandleId | null => {
      const margin = 10;

      const cx = crop.x;
      const cy = crop.y;
      const cr = cx + crop.width;
      const cb = cy + crop.height;

      const nearLeft = Math.abs(mx - cx) < margin;
      const nearRight = Math.abs(mx - cr) < margin;
      const nearTop = Math.abs(my - cy) < margin;
      const nearBottom = Math.abs(my - cb) < margin;

      const inXRange = mx > cx - margin && mx < cr + margin;
      const inYRange = my > cy - margin && my < cb + margin;

      if (nearLeft && nearTop) return "nw";
      if (nearRight && nearTop) return "ne";
      if (nearLeft && nearBottom) return "sw";
      if (nearRight && nearBottom) return "se";

      if (!locked) {
        if (nearTop && inXRange) return "n";
        if (nearBottom && inXRange) return "s";
        if (nearLeft && inYRange) return "w";
        if (nearRight && inYRange) return "e";
      }

      if (mx > cx && mx < cr && my > cy && my < cb) return "pan-image";


      return "pan-image";
    },
    [crop, locked]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const hit = hitTest(mx, my);
      if (!hit) return;

      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      setDragging(hit);
      dragStart.current = {
        mx,
        my,
        crop: { ...crop },
        pan: { ...pan },
      };
    },
    [hitTest, crop, pan]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (!dragging) {
        const hit = hitTest(mx, my);
        if (canvasRef.current) {
          if (hit === "pan-image") {
            canvasRef.current.style.cursor = "grab";
          } else if (hit === "move-crop") {
            canvasRef.current.style.cursor = "move";
          } else if (hit) {
            canvasRef.current.style.cursor = getCursorForHandle(hit);
          } else {
            canvasRef.current.style.cursor = "default";
          }
        }
        return;
      }

      const dx = mx - dragStart.current.mx;
      const dy = my - dragStart.current.my;

      if (dragging === "pan-image") {
        if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
        const newPan = clampPan(
          dragStart.current.pan.x + dx,
          dragStart.current.pan.y + dy
        );
        setPan(newPan);
        return;
      }

      if (dragging === "move-crop") return;

      const sc = dragStart.current.crop;
      const container = containerRef.current;

      if (!container) return;

      const cw = container.clientWidth;
      const ch = container.clientHeight;

      let newX = sc.x;
      let newY = sc.y;
      let newW = sc.width;
      let newH = sc.height;

      const isLeft = dragging === "nw" || dragging === "sw" || dragging === "w";
      const isRight = dragging === "ne" || dragging === "se" || dragging === "e";
      const isTop = dragging === "nw" || dragging === "ne" || dragging === "n";
      const isBottom = dragging === "sw" || dragging === "se" || dragging === "s";

      if (isLeft) {
        newX = clamp(sc.x + dx, 0, sc.x + sc.width - minCropSize);
        newW = sc.width - (newX - sc.x);
      }
      if (isRight) {
        newW = clamp(sc.width + dx, minCropSize, cw - sc.x);
      }
      if (isTop) {
        newY = clamp(sc.y + dy, 0, sc.y + sc.height - minCropSize);
        newH = sc.height - (newY - sc.y);
      }
      if (isBottom) {
        newH = clamp(sc.height + dy, minCropSize, ch - sc.y);
      }

      if (locked && aspectRatio) {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx >= absDy) {
          newH = newW / aspectRatio;
          if (isTop) newY = sc.y + sc.height - newH;
        } else {
          newW = newH * aspectRatio;
          if (isLeft) newX = sc.x + sc.width - newW;
        }

        if (newX < 0) {
          newX = 0;
          newW = sc.x + sc.width;
          newH = newW / aspectRatio;
          if (isTop) newY = sc.y + sc.height - newH;
        }
        if (newY < 0) {
          newY = 0;
          newH = sc.y + sc.height;
          newW = newH * aspectRatio;
          if (isLeft) newX = sc.x + sc.width - newW;
        }
        if (newX + newW > cw) {
          newW = cw - newX;
          newH = newW / aspectRatio;
          if (isTop) newY = sc.y + sc.height - newH;
        }
        if (newY + newH > ch) {
          newH = ch - newY;
          newW = newH * aspectRatio;
          if (isLeft) newX = sc.x + sc.width - newW;
        }
      }

      if (newW < minCropSize) newW = minCropSize;
      if (newH < minCropSize) newH = minCropSize;

      setCrop({ x: newX, y: newY, width: newW, height: newH });
    },
    [dragging, hitTest, clampPan, minCropSize, locked, aspectRatio]
  );

  const handlePointerUp = useCallback(() => {
    if (dragging === "pan-image" && canvasRef.current) {
      canvasRef.current.style.cursor = "grab";
    }
    setDragging(null);
  }, [dragging]);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setZoom((z) => clamp(z + delta, 1, 4));
    },
    []
  );

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });

    setBaseSize((s) => ({ ...s }));
  }, []);

  const handleCrop = useCallback(() => {
    if (!imageRef.current || !containerRef.current || baseSize.w === 0) return;

    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;

    const imgX = (cw - imgDisplayW) / 2 + pan.x;
    const imgY = (ch - imgDisplayH) / 2 + pan.y;

    const cropOnImgX = crop.x - imgX;
    const cropOnImgY = crop.y - imgY;
    const cropOnImgW = crop.width;
    const cropOnImgH = crop.height;

    const scaleX = imgNatural.w / imgDisplayW;
    const scaleY = imgNatural.h / imgDisplayH;

    const naturalCrop = {
      x: Math.round(cropOnImgX * scaleX),
      y: Math.round(cropOnImgY * scaleY),
      width: Math.round(cropOnImgW * scaleX),
      height: Math.round(cropOnImgH * scaleY),
    };

    naturalCrop.x = Math.max(0, naturalCrop.x);
    naturalCrop.y = Math.max(0, naturalCrop.y);
    naturalCrop.width = Math.min(naturalCrop.width, imgNatural.w - naturalCrop.x);
    naturalCrop.height = Math.min(naturalCrop.height, imgNatural.h - naturalCrop.y);

    const outCanvas = document.createElement("canvas");
    outCanvas.width = naturalCrop.width;
    outCanvas.height = naturalCrop.height;
    const ctx = outCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      imageRef.current,
      naturalCrop.x,
      naturalCrop.y,
      naturalCrop.width,
      naturalCrop.height,
      0,
      0,
      naturalCrop.width,
      naturalCrop.height
    );

    const dataUri = outCanvas.toDataURL(outputFormat, outputQuality);
    onCropComplete(dataUri);
    onOpenChange(false);
  }, [crop, pan, imgDisplayW, imgDisplayH, imgNatural, baseSize, onCropComplete, onOpenChange, outputFormat, outputQuality]);

  const cropDimensions = useMemo(() => {
    if (imgDisplayW === 0) return { w: 0, h: 0 };
    const scaleX = imgNatural.w / imgDisplayW;
    const scaleY = imgNatural.h / imgDisplayH;
    return {
      w: Math.round(crop.width * scaleX),
      h: Math.round(crop.height * scaleY),
    };
  }, [crop, imgDisplayW, imgDisplayH, imgNatural]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div
          ref={containerRef}
          className="relative w-full h-[400px] bg-background overflow-hidden select-none"
          onWheel={handleWheel}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-foreground/80 px-2.5 py-1 text-xs font-mono text-background">
            {cropDimensions.w} x {cropDimensions.h} px
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-card space-y-4">
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
            <Slider
              min={100}
              max={400}
              step={1}
              value={[zoom * 100]}
              onValueChange={([v]) => setZoom(v / 100)}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono text-muted-foreground w-12 text-right shrink-0">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-end">

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Visszaállítás
            </Button>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button variant="outline" className="bg-transparent" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          <Button onClick={handleCrop}>Feltöltés</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}