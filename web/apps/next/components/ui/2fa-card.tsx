import { useAuth } from "@/components/auth-provider";
import { fetchData } from "@/lib/utils";
import { Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";

const _2FACard = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)
    const [show2FA, setShow2FA] = useState(false);

    const _2FAref = useRef<HTMLButtonElement>(null);

    const router = useRouter()
    const { login } = useAuth()

    useEffect(() => {
        if(show2FA && _2FAref.current) {
            _2FAref.current.click();
        }
    }, [show2FA]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
    
        const response = await fetchData("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password })
        })
    
        if(response.statusCode && response.statusCode === 401) {
          setLoading(false);
          alert("Hibás felhasználónév vagy jelszó!");
          return;
        }
    
        else if(response.statusCode && response.statusCode === 423) {
          setLoading(false);
          setShow2FA(true);
          return;
        }
        
        login(response);
        localStorage.setItem("token", response.token);
    
        router.push("/");
      }

    return (
        <Card className="card w-full max-w-md space-y-6 border-none">
        <CardContent className="p-0">
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="username" className="text-white">
                Felhasználónév
            </Label>
            <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                id="username"
                type="text"
                placeholder="Felhasználónév"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white pl-10"
                required
                />
            </div>
            </div>

            <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
                Jelszó
            </Label>
            <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                id="password"
                type="password"
                placeholder="Jelszó"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white pl-10"
                required
                />
            </div>
            </div>

            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-zinc-600 data-[state=checked]:bg-green-600"
                />
                <Label htmlFor="remember" className="text-sm text-zinc-400">
                Emlékezz rám
                </Label>
            </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                Bejelentkezés
            </Button>
        </form>
        </CardContent>
    </Card>
    );
};


export default _2FACard;