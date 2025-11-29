'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export const FacebookPixel = () => {
    const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!loaded) return;
        import('react-facebook-pixel')
            .then((x) => x.default)
            .then((ReactPixel) => {
                ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID!);
                ReactPixel.pageView();
            });
    }, [pathname, searchParams, loaded]);

    return (
        <div>
            <Script
                id="fb-pixel"
                src="https://connect.facebook.net/en_US/fbevents.js"
                onLoad={() => setLoaded(true)}
                strategy="afterInteractive"
            />
        </div>
    );
};
