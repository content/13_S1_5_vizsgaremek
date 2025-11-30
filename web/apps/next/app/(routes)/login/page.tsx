"use client";
import { useAuth } from "@/components/auth-provider";
import { signIn, useSession } from "next-auth/react";
import React from "react";

export function LoginPage() {
    const { data: session } = useSession();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');


    const handleLogin = async () => {
        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            console.error('Login failed:', result.error);
        } else {
            console.log('Login successful');
        }
    };

    console.log('Session data:', session);

    return (
        <div>
            <div>Login page</div>
            {session?.user ? <div>Logged in as {session.user.email}</div> : 
            <div className="flex flex-col w-52 gap-3">
                Not logged in
                <input className="text-green-600" type="text" onChange={e => setEmail(e.target.value)} />
                <input className="text-green-600" type="password" onChange={e => setPassword(e.target.value)} />
                <button onClick={handleLogin}>Login</button>
            </div>}
        </div>
    );
};


export default LoginPage;