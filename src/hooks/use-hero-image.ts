
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function getHeroImage(): Promise<string | undefined> {
    const docRef = doc(db, 'app-config', 'landingPage');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().heroImage;
    }
    return undefined;
}

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
