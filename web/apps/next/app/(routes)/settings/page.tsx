"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  GraduationCap,
  Menu,
  User,
  Camera,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Check,
  AlertCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
import { useNotificationProvider } from "@/components/notification-provider"
import { redirect } from "next/navigation"
import BannerUploadButton from "@/components/elements/attachments/banner-upload-button"
import ProfilePictureUploadButton from "@/components/elements/attachments/profile-picture-upload-button"

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { notify } = useNotificationProvider();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Profile save state
  const [profileSaved, setProfileSaved] = useState(false);

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

  const handleRemoveProfileImage = () => {
    setProfileImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSaveProfile = () => {
    // Placeholder: replace with your own save logic
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const handleEmailChangeRequest = () => {
    if (!newEmail || newEmail === email) return
    // Placeholder: replace with your own email verification logic
    setEmailVerificationSent(true)
  }

  const handleEmailVerification = () => {
    if (!emailVerificationCode) return
    // Placeholder: replace with your own verification logic
    setEmail(newEmail)
    setNewEmail("")
    setEmailVerificationCode("")
    setEmailVerificationSent(false)
    setEmailDialogOpen(false)
  }

  const handlePasswordChange = () => {
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

    setPasswordSuccess(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                      Kép feltöltése
                    </Button>
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

            {/* Personal Information Section */}
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Keresztnév</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Keresztnév"
                    />
                  </div>
                </div>

                {/* Email with verification */}
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
                  <Button onClick={handleSaveProfile}>Mentés</Button>
                  {profileSaved && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                      <Check className="h-4 w-4" />
                      Sikeresen mentve!
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Password Section */}
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
                      placeholder="Legalább 8 karakter"
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

            {/* Danger Zone */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Veszélyes zóna</CardTitle>
                <CardDescription>
                  A fiók törlése végleges, és nem vonható vissza.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">Fiók törlése</Button>
              </CardContent>
            </Card>
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

          {!emailVerificationSent ? (
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
          ) : (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  Megerősítő kód elküldve: <strong className="text-foreground">{newEmail}</strong>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Megerősítő kód</Label>
                <Input
                  id="verificationCode"
                  value={emailVerificationCode}
                  onChange={(e) => setEmailVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="font-mono text-center tracking-widest text-lg"
                  maxLength={6}
                />
              </div>
            </div>
          )}

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
            {!emailVerificationSent ? (
              <Button
                onClick={handleEmailChangeRequest}
                disabled={!newEmail || newEmail === email}
              >
                Kód küldése
              </Button>
            ) : (
              <Button
                onClick={handleEmailVerification}
                disabled={!emailVerificationCode}
              >
                Megerősítés
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
