import {
    Body,
    Container,
    Head,
    Html,
    Heading,
    Tailwind,
    Text,
    Link
} from "@react-email/components";

type ForgotPasswordEmailProps = {
    firstName: string;
    lastName: string;
    resetToken: string;
}

export default function ForgotPasswordEmail({ resetToken, firstName, lastName }: ForgotPasswordEmailProps) {
    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="bg-card-100 text-card-900 font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[13px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            <strong>Jelszó</strong> visszaállítása
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Üdv <strong>{firstName} {lastName}</strong>,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Jelszó visszaállítási kérelmet kaptunk a Studify fiókodhoz.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Kattints az alábbi gombra új jelszó létrehozásához:
                        </Text>
                        <Link className="bg-green-600 rounded-lg px-3 py-2 text-white" href={`${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`}>
                            Jelszó visszaállítása
                        </Link>
                        <Text className=""></Text>
                        <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
                            A link egy óráig érvényes, és csak egyszer használható fel. Ha nem te kezdeményezted ezt a kérést, kérjük hagyd figyelmen kívül ezt az emailt, és a jelszavad biztonságban marad.
                        </Text>
                        <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
                            Ha bármilyen problémád akadna, írj egy e-mailt az{" "}
                            <Link href="mailto:studifyapp.hu@gmail.com" className="text-green-600 no-underline">
                                studifyapp.hu@gmail.com
                            </Link>
                            {" "}e-mail címre.
                            <br />
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
