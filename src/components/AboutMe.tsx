import {
    Card,
    CardTitle,
    CardHeader,
    CardContent
} from "@/components/ui/card";

export const AboutMe = ( ) => {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    {/* Write 1-2 sentences about yourself */}
                    I am a software developer and designer with expertise in building efficient, user-friendly applications across different platforms. With a focus on problem-solving and creative design, I enjoy crafting innovative solutions that make a difference.
                </p>
            </CardContent>
        </Card>
    )
}