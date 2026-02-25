import {
    Body,
    Container,
    Head,
    Html,
    Tailwind
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