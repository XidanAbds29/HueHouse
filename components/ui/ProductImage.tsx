'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProductImageProps {
    src?: string;
    alt: string;
    className?: string;
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className={cn("flex items-center justify-center bg-gray-200 text-gray-400 aspect-square", className)}>
                <ImageOff className="w-1/3 h-1/3" />
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden aspect-square bg-gray-100", className)}>
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                onError={() => setError(true)}
            />
        </div>
    );
}
