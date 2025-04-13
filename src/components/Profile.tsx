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
    const [lightGifSrc, setLightGifSrc] = useState('/white-bg-r1.gif');
    const [darkGifSrc, setDarkGifSrc] = useState('/black-bg-r1.gif');

    const reloadGif = (setSrc: (src: string) => void, src: string, selector: string) => {
        const timestamp = new Date().getTime();
        setSrc(`${src}?t=${timestamp}`);
        const imageElements = document.querySelectorAll(selector);
        imageElements.forEach((img) => {
            img.classList.add('border-[#ff79c6]', 'transition-all', 'ease-in-out', 'duration-1000');
            setTimeout(() => {
                img.classList.remove('border-[#ff79c6]');
            }, 1000);
        });
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
                            onClick={() => reloadGif(setLightGifSrc, lightGifSrc, '#light-profile-pic')}
                        />
                        <Image
                            src={darkGifSrc}
                            id="dark-profile-pic"
                            alt="Profile Picture"
                            width={150}
                            height={150}
                            unoptimized={true}
                            className="rounded-full size-12 md:w-full h-auto object-cover border-2 hidden dark:block hover:cursor-pointer"
                            onClick={() => reloadGif(setDarkGifSrc, darkGifSrc, '#dark-profile-pic')}
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
                            window.open('/resume/Abdul Rahman - Resume.pdf', '_blank')
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