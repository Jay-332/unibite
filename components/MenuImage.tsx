"use client";

import Image from 'next/image';
import { useState } from 'react';

interface MenuImageProps {
    src: string;
    alt: string;
}

export default function MenuImage({ src, alt }: MenuImageProps) {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Check if it's a base64 image or external URL
    const isBase64 = src?.startsWith('data:');
    const hasValidSrc = src && src.length > 0;

    // Show emoji fallback if no src, error loading, or invalid src
    if (!hasValidSrc || error) {
        return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-5xl">🍲</span>
            </div>
        );
    }

    if (isBase64) {
        // Use regular img tag for base64 images
        return (
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                onError={() => setError(true)}
            />
        );
    }

    return (
        <div className="relative w-full h-full bg-gray-100">
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl">🍲</span>
                </div>
            )}
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                onError={() => setError(true)}
                onLoad={() => setLoaded(true)}
                unoptimized
            />
        </div>
    );
}
