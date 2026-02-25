import {
    Body,
    Container,
    Head,
    Html,
    Tailwind
} from "@react-email/components";

type verifyEmailProps = {
    firstName: string;
    lastName: string;
    email: string;
}

export default function VerifyEmail({ email, firstName, lastName }: verifyEmailProps) {
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