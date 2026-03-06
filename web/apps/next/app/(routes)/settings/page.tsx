"use client"

import ProfilePictureUploadButton from "@/components/elements/attachments/profile-picture-upload-button"
import { useNotificationProvider } from "@/components/notification-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  Camera,
  Check,
  Eye,
  EyeOff,
  Mail,
  Trash2
} from "lucide-react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { genUploader } from "uploadthing/client"

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { notify } = useNotificationProvider();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newEmail, setNewEmail] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [profileSaved, setProfileSaved] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (status === "loading") return

    if(!session || !session.user) {
      redirect("/login");
    }
    
    const { first_name, last_name, email } = session.user;

    setFirstName(first_name || "")
    setLastName(last_name || "")
    setEmail(email || "")
    setProfileImage(session.user.profile_picture || null)
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-8">
          <div className="h-10 w-1/3 bg-muted/30 rounded-md animate-pulse" />
          <div className="h-4 w-1/2 bg-muted/20 rounded-md animate-pulse" />

          <div className="space-y-6">
            <div className="h-48 bg-muted/20 rounded-md animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-6 bg-muted/20 rounded-md animate-pulse" />
              <div className="h-6 bg-muted/20 rounded-md animate-pulse" />
            </div>
            <div className="h-6 bg-muted/20 rounded-md animate-pulse" />
            <div className="h-40 bg-muted/20 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveProfileImage = async () => {
    const response = await fetch(`/api/account/picture/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      notify('Hiba történt a profilkép eltávolítása során.', { type: 'error' });
    }

    switch(response.status) {
      case 200:
        notify('Profilkép sikeresen eltávolítva.', { type: 'success' });
        break;
      default:
        notify('Hiba történt a profilkép eltávolítása során.', { type: 'error' });
    }

    setProfileImage(null)
  }

  const handleUploadProfileImage = async () => {
    if (!profileImage || !(profileImage instanceof File)) {
      notify('Nincs kiválasztott feltöltendő fájl.', { type: 'error' });
      return;
    }

    setIsUploadingImage(true);
    try {
      const { uploadFiles } = genUploader({ fetch: window.fetch });
      const uploadRes = await uploadFiles('imageUploader', { files: [profileImage] });
      const fileInfo = Array.isArray(uploadRes) ? uploadRes[0] : uploadRes?.[0] ?? uploadRes;
      const url = fileInfo?.ufsUrl ?? fileInfo?.url ?? null;

      if (!url) {
        notify('Nem sikerült feltölteni a képet.', { type: 'error' });
        return;
      }

      const picRes = await fetch('/api/account/picture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePicture: url }),
      });

      if (!picRes.ok) {
        const data = await picRes.json().catch(() => ({}));
        notify(data.error || 'Hiba a profilkép mentése során.', { type: 'error' });
        return;
      }

      setProfileImage(url);
      notify('Profilkép sikeresen feltöltve.', { type: 'success' });
    } catch (err) {
      console.error('Upload error', err);
      notify('Hiba történt a kép feltöltése során.', { type: 'error' });
    } finally {
      setIsUploadingImage(false);
    }
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      if (session && session.user) {
        const currFirst = session.user.first_name || "";
        const currLast = session.user.last_name || "";
        if (currFirst !== firstName || currLast !== lastName) {
          const res = await fetch('/api/account/name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName }),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            notify(data.error || 'Hiba a név frissítése során.', { type: 'error' });
            setIsSavingProfile(false);
            return;
          }

          notify('Név sikeresen frissítve.', { type: 'success' });
        }
      }

      // Handle profile picture upload if it's a File
      if (profileImage && profileImage instanceof File) {
        try {
          const { uploadFiles } = genUploader({ fetch: window.fetch });
          const uploadRes = await uploadFiles('imageUploader', { files: [profileImage] });
          const fileInfo = Array.isArray(uploadRes) ? uploadRes[0] : uploadRes?.[0] ?? uploadRes;
          const url = fileInfo?.ufsUrl ?? fileInfo?.url ?? null;

          if (!url) {
            notify('Nem sikerült feltölteni a képet.', { type: 'error' });
            setIsSavingProfile(false);
            return;
          }

          const picRes = await fetch('/api/account/picture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profilePicture: url }),
          });

          if (!picRes.ok) {
            const data = await picRes.json().catch(() => ({}));
            notify(data.error || 'Hiba a profilkép mentése során.', { type: 'error' });
            setIsSavingProfile(false);
            return;
          }

          notify('Profilkép frissítve.', { type: 'success' });
        } catch (err) {
          console.error('Upload error', err);
          notify('Hiba történt a kép feltöltése során.', { type: 'error' });
          setIsSavingProfile(false);
          return;
        }
      }

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } finally {
      setIsSavingProfile(false);
    }
  }

  const handleEmailChangeRequest = async () => {
    if (!newEmail || newEmail === email) return
    
    const response = await fetch("/api/account/change-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newEmail }),
    })

    if(!response.ok) {
      const result = await response.json()
      notify(result.error || "Hiba történt a megerősítő email küldése során!", { type: "error" })
      return
    }

    switch (response.status) {
      case 200:
        notify("Megerősítő email elküldve!", { type: "success" })
        break
      case 400:
        notify("Érvénytelen email cím!", { type: "error" })
        break
      case 401:
        notify("Nincs jogosultságod megváltoztatni az email címet!", { type: "error" })
        break
      default:
        notify("Hiba történt a megerősítő email küldése során!", { type: "error" })
    }

    setEmailVerificationSent(true)
  }

  const handlePasswordChange = async () => {
    setPasswordError("")
    setPasswordSuccess(false)

    if (!currentPassword) {
      setPasswordError("A jelenlegi jelszó megadása kötelező.")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("Az új jelszónak legalább 8 karakter hosszúnak kell lennie.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Az új jelszavak nem egyeznek.")
      return
    }

    try {
      const res = await fetch('/api/account/credentials/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPasswordError(data.error || 'Hiba a jelszó módosítása során.');
        notify(data.error || 'Hiba a jelszó módosítása során.', { type: 'error' });
        return;
      }

      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      notify('Jelszó sikeresen megváltoztatva.', { type: 'success' });
    } catch (err) {
      console.error(err);
      notify('Szerver hiba a jelszó módosítása során.', { type: 'error' });
    }
  }

  return (
    <div>
        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-balance">Beállítások</h1>
              <p className="text-muted-foreground mt-1">
                Fiókod adatainak és jelszavad kezelése.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profilkép</CardTitle>
                <CardDescription>
                  Kattints a képre a módosításhoz. Ajánlott méret: 256x256 px.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <ProfilePictureUploadButton 
                      onUpload={(file: File) => setProfileImage(file)}
                      defaultImage={typeof profileImage === 'string' ? profileImage : undefined}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    {profileImage instanceof File && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                        onClick={handleUploadProfileImage}
                        disabled={isUploadingImage || !(profileImage instanceof File)}
                      >
                        <Camera className="h-4 w-4" />
                        {isUploadingImage ? 'Feltöltés...' : 'Kép feltöltése'}
                      </Button>
                    )}
                    {profileImage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={handleRemoveProfileImage}
                      >
                        <Trash2 className="h-4 w-4" />
                        Kép eltávolítása
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Személyes adatok</CardTitle>
                <CardDescription>
                  Változtasd meg a neved vagy az email címed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Vezetéknév</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Vezetéknév"
                      maxLength={32}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Keresztnév</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Keresztnév"
                      maxLength={32}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email cím</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        className="pl-9 bg-muted/50 cursor-default"
                        maxLength={32}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="bg-transparent"
                      onClick={() => {
                        setNewEmail(email)
                        setEmailDialogOpen(true)
                        setEmailVerificationSent(false)
                        setEmailVerificationCode("")
                      }}
                    >
                      Módosítás
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Az email cím módosításához email megerősítés szükséges.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                    {isSavingProfile ? "Mentés..." : "Mentés"}
                  </Button>
                  {profileSaved && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                      <Check className="h-4 w-4" />
                      Sikeresen mentve!
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jelszó módosítása</CardTitle>
                <CardDescription>
                  Tartsd biztonságban a fiókodat egy erős jelszóval.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Jelenlegi jelszó</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Jelenlegi jelszavad"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showCurrentPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Új jelszó</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Új jelszó"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showNewPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Új jelszó megerősítése</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Jelszó megerősítése"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
                      </span>
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {passwordError}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button onClick={handlePasswordChange}>Jelszó módosítása</Button>
                  {passwordSuccess && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                      <Check className="h-4 w-4" />
                      Jelszó sikeresen módosítva!
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Veszélyes zóna</CardTitle>
                <CardDescription>
                  A fiók törlése végleges, és nem vonható vissza.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">Fiók törlése</Button>
              </CardContent>
            </Card> */}
          </div>
        </main>
        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email cím módosítása</DialogTitle>
            <DialogDescription>
              {emailVerificationSent
                ? "Elküldtünk egy megerősítő kódot az új email címedre. Kérjük, add meg a kódot az alábbiakban."
                : "Add meg az új email címedet. Megerősítő kódot küldünk az új címre."}
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">Új email cím</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="uj.email@pelda.hu"
                />
              </div>
            </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEmailDialogOpen(false)
                setEmailVerificationSent(false)
                setEmailVerificationCode("")
              }}
            >
              Mégse
            </Button>
              <Button
                onClick={handleEmailChangeRequest}
                disabled={!newEmail || newEmail === email}
              >
                Küldés
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
