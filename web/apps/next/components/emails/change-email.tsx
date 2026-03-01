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

type verifyEmailProps = {
    newEmail: string;
    firstName: string;
    lastName: string;
    verifyHash: string;
}

export default function ChangeEmail({ verifyHash, newEmail, firstName, lastName }: verifyEmailProps) {
    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="bg-card-100 text-card-900 font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[13px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            <strong>Email</strong> módosítása!
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Üdv <strong>{firstName} {lastName}</strong>,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Biztosan megszeretnéd változtatni a Studify fiókodhoz tartozó email címet erre: <strong>{newEmail}</strong>?
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Kattints az alábbi gombra a művelet megerősítéséhez:
                        </Text>
                        <Link className="bg-green-600 rounded-lg px-3 py-2 text-white" href={`${process.env.NEXTAUTH_URL}/register/verify?token=${verifyHash}`}>
                            Email változtatás megerősítése
                        </Link>
                        <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
                            A link egy óráig érvényes, és csak egyszer használható fel. Ha nem te kezdeményezted ezt a változtatást, kérjük hagyd figyelmen kívül ezt az emailt.
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