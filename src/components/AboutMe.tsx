import { LinkIcon } from "lucide-react";
import {
    Card,
    CardTitle,
    CardHeader,
    CardContent
} from "@/components/ui/card";

export const AboutMe = ({ id }: { id?: string }) => {
    return (
        <section id={id}>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center group">
                        About Me
                        <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
                        </a>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        {/* Write 1-2 sentences about yourself */}
                        I am a software developer and designer with expertise in building efficient, user-friendly applications across different platforms. With a focus on problem-solving and creative design, I enjoy crafting innovative solutions that make a difference.
                    </p>
                </CardContent>
            </Card>
        </section>
    )
}