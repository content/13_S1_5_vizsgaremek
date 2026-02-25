import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Tailwind,
    Text
} from "@react-email/components";

import { Course, Post } from "@studify/types";

type NewPostEmailProps = {
    post: Post;
    course: Course;
};

export default function NewPostEmail({ course, post }: NewPostEmailProps) {
    return (
        <Html>
            <Head />
            <Tailwind>
                <Body>
                    <Container>
                        
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}