'use client';

import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import AnilistIcon from "@/components/icons/AnilistIcon";
import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import easterEggMessages from '@/data/easterEggMessages.json';
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const PROFILE_PICTURE_LIGHT = '/pfp-light.png';
const PROFILE_PICTURE_DARK = '/pfp-dark.png';

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
  {
    name: "Anilist",
    link: "https://anilist.co/user/abdxdev",
    icon: <AnilistIcon className="size-4 fill-primary" />
  }
]

export const Profile = () => {
  const lightGifPath = '/bfg-r1.gif';
  const darkGifPath = '/wfg-r1.gif';

  const lightPlaceholder = '/bfg.png';
  const darkPlaceholder = '/wfg.png';

  const [lightGifSrc, setLightGifSrc] = useState(lightGifPath);
  const [darkGifSrc, setDarkGifSrc] = useState(darkGifPath);
  const [onCooldown, setOnCooldown] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Whether to show the spinning logo instead of pfp
  const [showLogo, setShowLogo] = useState(false);
  const revertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Easter egg states
  const [lightPopoverOpen, setLightPopoverOpen] = useState(false);
  const [darkPopoverOpen, setDarkPopoverOpen] = useState(false);
  const [easterEggMessage, setEasterEggMessage] = useState('');

  // Reset the 5-second inactivity timer
  const resetRevertTimer = useCallback(() => {
    if (revertTimerRef.current) clearTimeout(revertTimerRef.current);
    revertTimerRef.current = setTimeout(() => {
      setShowLogo(false);
    }, 5000);
  }, []);

  // Click on pfp → show spinning logo
  const handlePfpClick = () => {
    setShowLogo(true);
    resetRevertTimer();
  };

  const reloadGif = (isLight: boolean) => {
    if (isReloading || onCooldown) return;

    // Reset the revert timer on each interaction
    resetRevertTimer();

    setOnCooldown(true);
    setTimeout(() => {
      setOnCooldown(false);
    }, 1800);

    setIsReloading(true);

    const selector = isLight ? '#light-profile-pic' : '#dark-profile-pic';
    const setSrc = isLight ? setLightGifSrc : setDarkGifSrc;
    const placeholderSrc = isLight ? lightPlaceholder : darkPlaceholder;
    const gifSrc = isLight ? lightGifPath : darkGifPath;

    const imageElement = document.querySelector(selector);
    if (imageElement) {
      imageElement.classList.add('border-[#ff79c6]', 'transition-all', 'ease-in-out', 'duration-1000');
      setTimeout(() => {
        imageElement.classList.remove('border-[#ff79c6]');
      }, 1000);
    }

    setSrc(placeholderSrc);
    setTimeout(() => {
      setSrc(`${gifSrc}?t=${Date.now()}`);
      const randomMessage = easterEggMessages[Math.floor(Math.random() * easterEggMessages.length)];
      setEasterEggMessage(randomMessage);

      if (isLight) {
        setLightPopoverOpen(true);
      } else {
        setDarkPopoverOpen(true);
      }

      setTimeout(() => {
        if (isLight) {
          setLightPopoverOpen(false);
        } else {
          setDarkPopoverOpen(false);
        }
      }, 1800);

      setIsReloading(false);
    }, 10);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col items-start gap-2 ">
          <div className="flex flex-row md:flex-col w-full">
            <div className="flex-none mr-4 md:mr-0 md:mb-4 relative">
              {/* Profile Picture layer */}
              <div className={`transition-opacity duration-500 ${showLogo ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <Image
                  src={PROFILE_PICTURE_LIGHT}
                  id="profile-pic-light"
                  alt="Abdul Rahman - Software Developer Profile Picture (Light Mode)"
                  width={150}
                  height={150}
                  loading="eager"
                  className="rounded-full size-12 md:w-full h-auto object-cover border-2 dark:hidden hover:cursor-pointer"
                  onClick={handlePfpClick}
                />
                <Image
                  src={PROFILE_PICTURE_DARK}
                  id="profile-pic-dark"
                  alt="Abdul Rahman - Software Developer Profile Picture (Dark Mode)"
                  width={150}
                  height={150}
                  loading="eager"
                  className="rounded-full size-12 md:w-full h-auto object-cover border-2 hidden dark:block hover:cursor-pointer"
                  onClick={handlePfpClick}
                />
              </div>

              {/* Spinning Logo layer */}
              <div className={`absolute inset-0 transition-opacity duration-500 ${showLogo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <Popover open={lightPopoverOpen} onOpenChange={setLightPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Image
                        src={lightGifSrc}
                        id="light-profile-pic"
                        alt="Abdul Rahman - Software Developer Profile Picture (Light Mode)"
                        width={150}
                        height={150}
                        unoptimized={true}
                        loading="eager"
                        className="rounded-full size-12 md:w-full h-auto object-cover border-2 dark:hidden hover:cursor-pointer"
                        onClick={() => reloadGif(true)}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 text-center" side="top">
                    {easterEggMessage}
                  </PopoverContent>
                </Popover>

                <Popover open={darkPopoverOpen} onOpenChange={setDarkPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Image
                        src={darkGifSrc}
                        id="dark-profile-pic"
                        alt="Abdul Rahman - Software Developer Profile Picture (Dark Mode)"
                        width={150}
                        height={150}
                        unoptimized={true}
                        loading="eager"
                        className="rounded-full size-12 md:w-full h-auto object-cover border-2 hidden dark:block hover:cursor-pointer"
                        onClick={() => reloadGif(false)}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 text-center" side="top">
                    {easterEggMessage}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Text content */}
            <div className="flex flex-col items-start justify-center">
              <h1 className="font-bold md:mt-0 text-xl md:text-2xl">Abdul Rahman</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Software Developer & UI/UX Designer
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
              window.open('/resume', '_blank')
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