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
    defaultImage?: string | null;
    styles?: {
        container?: string;
        imageWrapper?: string;
        buttonOverlay?: string;
        uploadButton?: string;
        icon?: string;
    };
}

export type ImageUploadButtonProps =
    | (BaseProps & { croppable?: false; aspectRatio?: never })
    | (BaseProps & { croppable: true; aspectRatio: number });

const defaultStyles = {
    container: '',
    imageWrapper: 'relative flex shrink-0 rounded-full items-center justify-center overflow-hidden border border-gray-500/30 bg-white/50 backdrop-blur-3xl dark:border-input dark:bg-black/30 dark:backdrop-blur-sm',
    buttonOverlay: 'group absolute top-0 size-full rounded-full',
    uploadButton: 'flex h-full w-full rounded-full items-center bg-zinc-900/10 font-medium text-white opacity-0 backdrop-blur-sm transition-all hover:border hover:!bg-black/70 group-hover:opacity-100',
    icon: 'size-12 text-center',
};

export default function ImageUploadButton({ className, onUpload, defaultImage, croppable = true, aspectRatio, styles }: ImageUploadButtonProps) {
    const mergedStyles = { 
        container: cn(defaultStyles.container, styles?.container),
        imageWrapper: cn(defaultStyles.imageWrapper, styles?.imageWrapper),
        buttonOverlay: cn(defaultStyles.buttonOverlay, styles?.buttonOverlay),
        uploadButton: cn(defaultStyles.uploadButton, styles?.uploadButton),
        icon: cn(defaultStyles.icon, styles?.icon),
     };
    
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

    const handleCropperOpenChange = useCallback((open: boolean) => {
        setCropperOpen(open);
        if (!open && tempFileRef.current) {
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

    const handleCropComplete = useCallback(async (dataUri: string) => {
        try {
            const res = await fetch(dataUri);
            const blob = await res.blob();
            const name = tempFileRef.current?.name || 'image.png';
            const file = new File([blob], name, { type: blob.type });

            if (previewRef.current) {
                try { URL.revokeObjectURL(previewRef.current); } catch {}
                previewRef.current = null;
            }

            setPreviewUrl(dataUri);
            setFileName(file.name);

            tempFileRef.current = null;

            onUpload(file);
        } catch (e) {
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
        <div className={cn(mergedStyles.container, className)}>
            <div className='relative flex flex-col items-center gap-2 align-top'>
                <div
                    className={mergedStyles.imageWrapper}
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
                <div className={mergedStyles.buttonOverlay}>
                    <Button
                        type='button'
                        onClick={handleButtonClick}
                        aria-haspopup='dialog'
                        className={mergedStyles.uploadButton}
                    >
                        {fileName ? (
                            <SquarePen className={mergedStyles.icon} />
                        ) : (
                            <ImageUpIcon className={mergedStyles.icon} />
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