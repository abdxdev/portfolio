import Image from "next/image";

import { CalendarDays } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

// import { JobImages } from "@/components/JobImages";
// import { log } from "console";

const jobs = [
    {
        role: "Backend Developer",
        company: "Freelance (Self Employed)",
        logo: "/avatar.svg",
        logo_dark: "/avatar-white.svg",
        duration: "2023 - Present",
        description: "Developed backend systems for web applications using Django, Flask, and .NET, including RESTful APIs, authentication, and database management.",
        images: [],
    },
    {
        role: "Graphic Designer",
        company: "Freelance (Self Employed)",
        logo: "/avatar.svg",
        logo_dark: "/avatar-white.svg",
        duration: "2021 - 2023",
        description: "Directed and designed the process for projects, including UI for web and mobile applications, packaging, branding, and social media posts for businesses.",
        images: [],
    },
]

export const Experience = () => {
    return (
        <>
            <h2 className="text-xl font-bold mb-4">Work Experience</h2>
            <Card>
                <CardContent className="pt-6">
                    <ul className="space-y-8">
                        {jobs.map((j, i) => (
                            <li key={i} className="border-b last:border-b-0 pb-8 last:pb-0">
                                {/* Job Details */}
                                <div className="flex items-center space-x-4">
                                    <Image
                                        src={j.logo}
                                        alt={j.company}
                                        width={40}
                                        height={40}
                                        className="rounded-md border shadow-md object-cover dark:hidden"
                                    />
                                    <Image
                                        src={j.logo_dark}
                                        alt={j.company}
                                        width={40}
                                        height={40}
                                        className="rounded-md border shadow-md object-cover hidden dark:block"
                                    />
                                    <div>
                                        <h3 className="font-semibold">
                                            {j.role}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {j.company}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                                    <CalendarDays className="size-3 mr-2" />
                                    {j.duration}
                                </p>
                                <p className="text-sm mt-2">{j.description}</p>
                                {/* Job Images */}
                                {/* <JobImages 
                                    role={j.role} 
                                    link={j.link}
                                    images={j.images} 
                                    duration={j.duration} 
                                /> */}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </>
    )
}