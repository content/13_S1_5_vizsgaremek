"use client";

import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function DashboardPage() {
    const router = useRouter();

    const { data: session } = useSession();
    const [ isLoading, setIsLoading ] = React.useState(true);

    useEffect(() => {
        if(session === null) {
            router.push('/login');
            return;
        }

        if (session) {
            setIsLoading(false);
        }
    }, [session]);

    return (
        isLoading ? (
            <div>
                <p>Betöltés...</p>
            </div>
        ) : (
            <div>
                <p>Bejelentkezve mint {session?.user?.email}</p>
                <Button onClick={() => signOut()}>Kijelentkezés</Button>
            </div>
        )
    );
}