'use client';

import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import AnilistIcon from "./svg/anilist";
import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ShinyText from "./ShinyText";
import { motion } from 'motion/react';
import { useAnimationSettings } from "@/components/animation-settings";
import { RainbowButton } from "./ui/rainbow-button";
import { InteractiveHoverButton } from "./ui/interactive-hover-button";
import { NumberTicker } from "./ui/number-ticker";
import { Skeleton } from "./ui/skeleton";
import { highlight } from "@/lib/highlight";
import { WordRotate } from "@/components/ui/word-rotate";
import { VideoIntroduction } from "./video-introduction";
import { ArrowUpRight, FileText, Send, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const PROFILE_PICTURE_LIGHT = '/pfp/dark.jpeg';
const PROFILE_PICTURE_DARK = '/pfp/dark.jpeg';

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
  const lightGifPath = '/logo/bfg-r1.gif';
  const darkGifPath = '/logo/wfg-r1.gif';

  const lightPlaceholder = '/logo/bfg.png';
  const darkPlaceholder = '/logo/wfg.png';

  const [lightGifSrc, setLightGifSrc] = useState(lightGifPath);
  const [darkGifSrc, setDarkGifSrc] = useState(darkGifPath);
  const [onCooldown, setOnCooldown] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Whether to show the spinning logo instead of pfp
  const [showLogo, setShowLogo] = useState(false);
  const { settings } = useAnimationSettings();

  const [repoCount, setRepoCount] = useState<number | null>(null);
  const [animeCount, setAnimeCount] = useState<number | null>(null);
  const [gameCount, setGameCount] = useState<number | null>(null);

  const [easterEggMessages, setEasterEggMessages] = useState<string[]>([]);

  const [subtitles, setSubtitles] = useState<string[]>([]);

  useEffect(() => {
    fetch('/assets/json/easterEggMessages.json')
      .then(res => res.json())
      .then(data => setEasterEggMessages(data));
    fetch('https://api.github.com/users/abdxdev').then(r => r.json()).then(data => {
      if (data?.public_repos) setRepoCount(data.public_repos);
    }).catch(() => { });
    fetch('/api/portfolio/anime').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAnimeCount(data.length);
    }).catch(() => { });
    fetch('/api/portfolio/games').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setGameCount(data.length);
    }).catch(() => { });
    fetch('/assets/json/subtitles.json').then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.every((v) => typeof v === 'string')) setSubtitles(data.map((s: string) => s.trim()).filter(Boolean));
    }).catch(() => { });
  }, []);
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

    const setSrc = isLight ? setLightGifSrc : setDarkGifSrc;
    const placeholderSrc = isLight ? lightPlaceholder : darkPlaceholder;
    const gifSrc = isLight ? lightGifPath : darkGifPath;

    highlight(isLight ? "light-profile-pic" : "dark-profile-pic");

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
    <Card>
      <CardContent>
        <div className="flex flex-col items-start gap-2 ">
          <div className="flex flex-row md:flex-col w-full">
            <div className="flex-none mr-4 md:mr-0 md:mb-4 relative">
              {/* Profile Picture layer */}
              <div className={`transition-opacity duration-500 ${showLogo ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {/* Wrapper div carries the border so ::before/::after pseudo-elements render */}
                <div
                  className="relative rounded-full size-12 md:w-full md:h-auto border-2 dark:hidden overflow-hidden hover:cursor-pointer"
                  onClick={handlePfpClick}
                >
                  <Image
                    src={PROFILE_PICTURE_LIGHT}
                    id="profile-pic-light"
                    alt="Abdul Rahman - Software Engineer Profile Picture (Light Mode)"
                    width={500}
                    height={500}
                    loading="eager"
                    className="rounded-full size-12 md:w-full h-auto object-cover"
                  />
                </div>
                <div
                  className="relative rounded-full size-12 md:w-full md:h-auto border-2 hidden dark:block overflow-hidden hover:cursor-pointer"
                  onClick={handlePfpClick}
                >
                  <Image
                    src={PROFILE_PICTURE_DARK}
                    id="profile-pic-dark"
                    alt="Abdul Rahman - Software Engineer Profile Picture (Dark Mode)"
                    width={500}
                    height={500}
                    loading="eager"
                    className="rounded-full size-12 md:w-full h-auto object-cover"
                  />
                </div>
              </div>

              {/* Spinning Logo layer */}
              <div className={`absolute inset-0 transition-opacity duration-500 ${showLogo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <Popover open={lightPopoverOpen} onOpenChange={setLightPopoverOpen}>
                  <PopoverTrigger asChild>
                    {/* Wrapper div carries the border so ::before/::after pseudo-elements render */}
                    <div
                      id="light-profile-pic"
                      className="relative rounded-full size-12 md:w-full md:h-auto border-2 dark:hidden overflow-hidden hover:cursor-pointer"
                      onClick={() => reloadGif(true)}
                    >
                      <Image
                        src={lightGifSrc}
                        alt="Abdul Rahman - Software Engineer Profile Picture (Light Mode)"
                        width={500}
                        height={500}
                        unoptimized={true}
                        loading="eager"
                        className="rounded-full size-12 md:w-full h-auto object-cover"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 text-center" side="top">
                    {easterEggMessage}
                  </PopoverContent>
                </Popover>

                <Popover open={darkPopoverOpen} onOpenChange={setDarkPopoverOpen}>
                  <PopoverTrigger asChild>
                    {/* Wrapper div carries the border so ::before/::after pseudo-elements render */}
                    <div
                      id="dark-profile-pic"
                      className="relative rounded-full size-12 md:w-full md:h-auto border-2 hidden dark:block overflow-hidden hover:cursor-pointer"
                      onClick={() => reloadGif(false)}
                    >
                      <Image
                        src={darkGifSrc}
                        alt="Abdul Rahman - Software Engineer Profile Picture (Dark Mode)"
                        width={500}
                        height={500}
                        unoptimized={true}
                        loading="eager"
                        className="rounded-full size-12 md:w-full h-auto object-cover"
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
              <div className="flex items-center gap-2">
                <motion.h1
                  layoutId={settings.introAnimation ? "name-heading" : undefined}
                  className="font-bold md:mt-0 text-xl md:text-2xl"
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                >
                  <ShinyText
                    disabled={!settings.shinyText}
                  >
                    Abdul Rahman
                  </ShinyText>
                </motion.h1>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      onClick={() => {
                        const audio = new Audio('/name-pronunciation.mp3');
                        audio.play();
                      }}
                      variant="ghost"
                      size="icon"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>ab-DOOL rah-MAAN</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                Software Engineer & UI/UX Designer
              </p>
            </div>

          </div>

          {/* Word Rotate */}
          {subtitles.length > 0 && (
            <div className="h-14 w-full flex items-center">
              <WordRotate
                words={subtitles}
                duration={4000}
                className="text-sm text-muted-foreground"
              />
            </div>
          )}

          <div className="flex w-full items-center justify-between text-center py-3 gap-5">
            <div className="flex flex-1 flex-col items-center gap-1">
              <span className="text-2xl font-mono text-foreground">
                {repoCount !== null ? <NumberTicker value={repoCount} /> : <Skeleton className="h-7 w-8 rounded" />}
              </span>
              <span className="text-xs text-muted-foreground">Repos<br />Published</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1">
              <span className="text-2xl font-mono text-foreground">
                {animeCount !== null ? <NumberTicker value={animeCount} /> : <Skeleton className="h-7 w-8 rounded" />}
              </span>
              <span className="text-xs text-muted-foreground">Anime<br />Watched</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1">
              <span className="text-2xl font-mono text-foreground">
                {gameCount !== null ? <NumberTicker value={gameCount} /> : <Skeleton className="h-7 w-8 rounded" />}
              </span>
              <span className="text-xs text-muted-foreground">Games<br />Played</span>
            </div>
          </div>

          <RainbowButton className="mt-2 w-full rounded-md font-semibold text-sm"
            startIcon={<Send className="h-4 w-4" />}
            onClick={() => {
              const section = document.getElementById("contact");
              section?.scrollIntoView({ behavior: "smooth", block: "center" });
              const card = section?.querySelector('[data-slot="card"]') as HTMLElement | null;
              if (card) highlight(card);
            }}>
            CONTACT ME
          </RainbowButton>

          <InteractiveHoverButton className="rounded-md w-full font-semibold text-sm"
            startIcon={<FileText className="h-4 w-4" />}
            icon={<ArrowUpRight className="h-4 w-4" />}
            onClick={() => {
              window.open('/resume', '_blank')
            }}>
            RESUME
          </InteractiveHoverButton>

          <VideoIntroduction />

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