import { useAuth } from "@/components/auth-provider";
import { fetchData } from "@/lib/utils";
import { Fingerprint, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Checkbox } from "./checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import TwoFactorInputs from "./twofactorinputs";
import { useNotificationProvider } from "../notification-provider";

const LoginCard = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false);

    const [show2FA, setShow2FA] = useState(false);

    const inputsRef = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
    const [_2FAInputs, set2FAInputs] = useState(Array(6).fill(""));

    const handle2FAChange = (index: number, value: string) => {
    set2FAInputs((prev) => {
        const newInputs = [...prev];
        newInputs[index] = value;
        return newInputs;
    });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value.replace(/\D/, ""); // allow only digits
      
        set2FAInputs((prev) => {
          const newInputs = [...prev];
          newInputs[index] = value;
      
          // jump to next if a digit was entered
          if (value && index < inputsRef.current.length - 1) {
            inputsRef.current[index + 1]?.focus();
          }
          return newInputs;
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
          e.preventDefault();
          inputsRef.current[index - 1]?.focus();
        }
      };

    const router = useRouter()
    const { login } = useAuth()
    const { notify } = useNotificationProvider();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const response = await fetchData("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            username, 
            password,
            twofact: _2FAInputs.length == 6 ? _2FAInputs.join("") : undefined,
          })
        });
        
        if(response.statusCode && response.statusCode === 401) {
          setLoading(false);
          notify("Sikertelen bejelentkezés!", { type: "error", description: "Hibás felhasználónév vagy jelszó." });
          return;
        }
    
        else if(response.statusCode && response.statusCode === 423) {
          setLoading(false);
          setShow2FA(true);
          return;
        }
        
        setShow2FA(false);
        login(response);
        localStorage.setItem("token", response.token);
      }

    return (
        <>
            <Card className="w-full max-w-md space-y-6 border-none bg-zinc-800">
                <CardContent className="p-0">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">
                        Felhasználónév
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400 " />
                        <Input
                            id="username"
                            type="text"
                            placeholder="Felhasználónév"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-zinc-700 border-zinc-700 text-white pl-10"
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
                            className="bg-zinc-700 border-zinc-700 text-white pl-10"
                            required
                        />
                    </div>
                    </div>

                    <div className="flex items-center justify-between">
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Bejelentkezés
                    </Button>
                </form>
                </CardContent>
        </Card>

        {/* 2FA Modal */}
        <Dialog open={show2FA} onOpenChange={setShow2FA}>
            <DialogContent className="bg-zinc-800" aria-describedby={undefined}>
                <form onSubmit={handleLogin}>
                    <DialogHeader>
                        <DialogTitle className="flex gap-2 items-center">
                            <Fingerprint className="text-green-400" size={20} />
                            Kétfaktoros Hitelesítés
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <p>A bejelentkezéshez szükséges a két lépcsős hitelesítés.</p>
                        <div className="flex gap-3 w-full">
                        <TwoFactorInputs values={_2FAInputs} onChange={handle2FAChange}/>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white">
                            Bejelentkezés
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    </>
    );
};

export default LoginCard;