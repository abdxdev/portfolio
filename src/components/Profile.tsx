'use client';

import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import AnilistIcon from "@/components/icons/AnilistIcon";
import { useState } from 'react';
import Image from 'next/image';

import {
    Card,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const socials = [
    {
        name: "Github",
        link: "https://github.com/abdxdev",
        icon: <FaGithub className="size-4" />
    },
    {
        name: "LinkedIn",
        link: "https://linkedin.com/in/abdxdev",
        icon: <FaLinkedin className="size-4" />
    },
    {
        name: "X (Twitter)",
        link: "https://x.com/abdxdev",
        icon: <FaXTwitter className="size-4" />
    },
    // {
    //     name: "Instagram",
    //     link: "https://instagram.com/abdxdev",
    //     icon: <FaInstagram className="size-4" />
    // },
    {
        name: "Anilist",
        link: "https://anilist.co/user/abdxdev",
        icon: <AnilistIcon className="size-4 fill-primary" />
    }
]

export const Profile = () => {
    const lightGifPath = '/white-bg-r1.gif';
    const darkGifPath = '/black-bg-r1.gif';
    
    // Placeholder static images
    const lightPlaceholder = '/bfg.png';
    const darkPlaceholder = '/wfg.png';
    
    // Source states for the images
    const [lightGifSrc, setLightGifSrc] = useState(lightGifPath);
    const [darkGifSrc, setDarkGifSrc] = useState(darkGifPath);
    
    // Flag to prevent multiple rapid clicks
    const [isReloading, setIsReloading] = useState(false);

    const reloadGif = (isLight: boolean) => {
        // Prevent multiple rapid clicks
        if (isReloading) return;
        setIsReloading(true);
        
        // Select the correct elements and paths based on light/dark mode
        const selector = isLight ? '#light-profile-pic' : '#dark-profile-pic';
        const setSrc = isLight ? setLightGifSrc : setDarkGifSrc;
        const placeholderSrc = isLight ? lightPlaceholder : darkPlaceholder;
        const gifSrc = isLight ? lightGifPath : darkGifPath;
        
        // Add visual feedback with border highlight
        const imageElement = document.querySelector(selector);
        if (imageElement) {
            imageElement.classList.add('border-[#ff79c6]', 'transition-all', 'ease-in-out', 'duration-1000');
            setTimeout(() => {
                imageElement.classList.remove('border-[#ff79c6]');
            }, 1000);
        }
        
        // First set to placeholder image
        setSrc(placeholderSrc);
        
        // After a very brief delay, set back to GIF to force reload
        setTimeout(() => {
            setSrc(gifSrc);
            setIsReloading(false);
        }, 10); // Just enough delay to trigger a reload
    };

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex flex-col items-start gap-2 ">
                    <div className="flex flex-row md:flex-col items-center md:items-start w-full gap-4">
                        <Image
                            src={lightGifSrc}
                            id="light-profile-pic"
                            alt="Profile Picture"
                            width={150}
                            height={150}
                            unoptimized={true}
                            className="rounded-full size-12 md:w-full h-auto object-cover border-2 dark:hidden hover:cursor-pointer"
                            onClick={() => reloadGif(true)}
                        />
                        <Image
                            src={darkGifSrc}
                            id="dark-profile-pic"
                            alt="Profile Picture"
                            width={150}
                            height={150}
                            unoptimized={true}
                            className="rounded-full size-12 md:w-full h-auto object-cover border-2 hidden dark:block hover:cursor-pointer"
                            onClick={() => reloadGif(false)}
                        />
                        <div className="flex flex-col items-start justify-center">
                            <h1 className="font-bold md:mt-4 text-xl md:text-2xl">Abdul Rahman</h1>
                            <p className="text-sm md:text-base text-muted-foreground">
                                Software Developer
                            </p>
                        </div>
                    </div>
                    <p className="mt-2 text-start text-sm text-muted-foreground">
                        I&apos;m a software developer and designer who lives by two mottos: &quot;Work smarter, not harder&quot; and &quot;If it&apos;s not broken, add more features.&quot;
                    </p>
                    <Button className="mt-2 w-full" asChild>
                        <Link
                            href="mailto:abdulrahman.abd.dev@gmail.com"
                            className="font-semibold w-full h-full"
                        >
                            CONTACT ME
                        </Link>
                    </Button>

                    <Button variant={"outline"} className="w-full hover:bg-primary hover:text-primary-foreground"
                        onClick={() => {
                            window.open('/abdxdev-resume', '_blank')
                        }}>
                        <p className="font-semibold w-full h-full">
                            RESUME
                        </p>
                    </Button>
                    <div className="mt-4 flex flex-col space-y-2 border-t border-border pt-4 w-full">
                        {socials.map((s, i) => {
                            const parts = s.link.split('/');
                            const username = parts[parts.length - 1];
                            return (
                                <Link
                                    key={i}
                                    href={s.link}
                                    target="_blank"
                                    aria-label={`${s.name} Logo`}
                                    className="cursor-pointer flex items-center gap-2 group"
                                >
                                    {s.icon}
                                    <span className="text-sm text-muted-foreground group-hover:text-primary transition-color duration-200 ease-linear">
                                        /{username}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}