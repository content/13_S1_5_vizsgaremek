'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CircleUserRound, ImageUpIcon, SquarePen } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ImageCropper } from './image-cropper';

interface BaseProps {
    className?: string;
    onUpload: (file: File) => void;
    defaultImage?: string;
}

export type ImageUploadButtonProps =
    | (BaseProps & { croppable?: false; aspectRatio?: never })
    | (BaseProps & { croppable: true; aspectRatio: number });

export default function BannerUploadButton({ className, onUpload, defaultImage, croppable = true, aspectRatio }: ImageUploadButtonProps) {
    if (croppable && typeof aspectRatio !== 'number') {
        throw new Error('image-upload-button: aspectRatio is required when croppable is true');
    }

    const previewRef = useRef<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const tempFileRef = useRef<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null);
    const [cropperOpen, setCropperOpen] = useState(false);

    const handleButtonClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];

            if (file) {
                setFileName(file.name);

                if (croppable) {
                    // open cropper with object URL, wait for crop
                    tempFileRef.current = file;
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                    previewRef.current = url;
                    setCropperOpen(true);
                } else {
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                    previewRef.current = url;
                    onUpload(file);
                }
            }
        },
        [onUpload, croppable]
    );

    const handleRemove = useCallback(() => {
        if (previewUrl) {
            try {
                URL.revokeObjectURL(previewUrl);
            } catch {}
        }
        setFileName(null);
        setPreviewUrl(null);
        previewRef.current = null;
        tempFileRef.current = null;
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [previewUrl]);

    // called when cropper open state changes (handles cancel case)
    const handleCropperOpenChange = useCallback((open: boolean) => {
        setCropperOpen(open);
        if (!open && tempFileRef.current) {
            // cropper was closed without completing crop -> clean up
            if (previewRef.current) {
                try { URL.revokeObjectURL(previewRef.current); } catch {}
            }
            previewRef.current = null;
            setPreviewUrl(defaultImage || null);
            setFileName(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            tempFileRef.current = null;
        }
    }, [defaultImage]);

    // invoked when cropper returns a data URI
    const handleCropComplete = useCallback(async (dataUri: string) => {
        try {
            // convert data URI to Blob, then File
            const res = await fetch(dataUri);
            const blob = await res.blob();
            const name = tempFileRef.current?.name || 'image.png';
            const file = new File([blob], name, { type: blob.type });

            // cleanup previous object URL
            if (previewRef.current) {
                try { URL.revokeObjectURL(previewRef.current); } catch {}
                previewRef.current = null;
            }

            // update preview to cropped data uri (can be used directly by <Image>)
            setPreviewUrl(dataUri);
            setFileName(file.name);

            // clear temp
            tempFileRef.current = null;

            // call the provided callback
            onUpload(file);
        } catch (e) {
            // swallow errors; caller can handle
            console.error('Failed to finalize cropped image', e);
        }
    }, [onUpload]);

    useEffect(() => {
        return () => {
            if (previewRef.current) {
                try { URL.revokeObjectURL(previewRef.current); } catch {}
            }
        };
    }, []);

    return (
        <div className={cn('', className)}>
            <div className='relative flex flex-col items-center gap-2 align-top'>
                <div
                    className='relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-500/30 bg-white/50 backdrop-blur-3xl dark:border-input dark:bg-black/30 dark:backdrop-blur-sm sm:size-32'
                    aria-label={previewUrl ? 'Előnézet' : 'Alapértelmezett kép'}
                >
                    {previewUrl ? (
                        <Image
                            className='h-full w-full object-cover'
                            src={previewUrl}
                            alt='Előnézet'
                            width={64}
                            height={64}
                        />
                    ) : (
                        <div aria-hidden='true'>
                            <CircleUserRound className='opacity-60 dark:invert-0' size={64} strokeWidth={2} />
                        </div>
                    )}
                </div>
                <div className='group absolute top-0 size-full rounded-full'>
                    <Button
                        type='button'
                        onClick={handleButtonClick}
                        aria-haspopup='dialog'
                        className='flex h-full w-full items-center rounded-full bg-zinc-900/10 font-medium text-white opacity-0 backdrop-blur-sm transition-all hover:border hover:!bg-black/70 group-hover:opacity-100'
                    >
                        {fileName ? (
                            <SquarePen className='size-10 text-center' />
                        ) : (
                            <ImageUpIcon className='size-10 text-center' />
                        )}
                    </Button>
                    <input
                        type='file'
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className='hidden'
                        accept='image/*'
                        aria-label='Upload image file'
                    />
                </div>
            </div>
            {fileName && (
                <div className='absolute mt-2 hidden'>
                    <div className='flex justify-center gap-2 text-xs'>
                        <p className='truncate text-muted-foreground' aria-live='polite'>
                            {fileName}
                        </p>{' '}
                        <button
                            onClick={handleRemove}
                            className='font-medium text-red-500 hover:underline'
                            aria-label={`Törlés: ${fileName}`}
                        >
                            Törlés
                        </button>
                    </div>
                </div>
            )}
            <div className='sr-only' aria-live='polite' role='status'>
                {previewUrl ? 'Image uploaded and preview available' : 'No image uploaded'}
            </div>

            {croppable && previewUrl && (
                <ImageCropper
                    src={previewUrl}
                    open={cropperOpen}
                    onOpenChange={handleCropperOpenChange}
                    aspectRatio={aspectRatio}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
}