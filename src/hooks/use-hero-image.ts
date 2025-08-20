
"use client";

import { useEffect, useState } from "react";
import { getHeroImage } from '@/lib/firestore';

export function useHeroImage(defaultImage: string) {
    const [heroImage, setHeroImage] = useState(defaultImage);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const storedImage = await getHeroImage();
                if (storedImage) {
                    setHeroImage(storedImage);
                }
            } catch (error) {
                console.log("Could not fetch hero image.", error);
            }
        }
        fetchImage();
    }, []);

    return heroImage;
}
