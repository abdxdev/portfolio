import Image from "next/image";

import { CalendarDays } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

// import { JobImages } from "@/components/JobImages";
// import { log } from "console";

const jobs = [
    {
        role: "Freelance Designer", 
        company: "Self-Employed", 
        logo: "/company.svg", 
        duration: "2021 - 2023",
        description:
            "Directed and designed the process for projects, including UI for web and mobile applications, packaging, branding, and social media posts for businesses.",
        images: [],
    },
    {
        role: "Freelance Backend Developer",
        company: "Self-Employed",
        logo: "/company.svg",
        duration: "2022 - Present",
        description:
            "Developed and maintained backend services for web applications, including RESTful APIs, serverless functions, and database management.",
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
                                        className="rounded-md border shadow-md object-cover"
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
                                    <CalendarDays className="size-3 mr-2"/>
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