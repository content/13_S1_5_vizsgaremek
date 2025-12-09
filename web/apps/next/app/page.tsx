"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, Users, Calendar, FileText, ArrowRight, Check, GraduationCap } from "lucide-react"
import Head from "next/head"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  

  useEffect(() => {
    if (session) {
      router.push('/dashboard');       
    }
  }, [session]);

  return (
    <div>
      <Head>
        <title>Studify</title>
        <meta property="og:title" content="Studify" key="title" />
      </Head>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-green-400-foreground" />
              </div>
              <span className="text-xl font-semibold">Studify</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link href="/login">Bejelentkezés</Link>
              </Button>
              <Button className="bg-green-500 hover:bg-green-600" asChild>
                <Link href="/register">Regisztráció</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Változtasd meg a tantermi élményt!</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Erősítsd az osztály közösséged és egyszerűsítsd a tanulás folyamatát a Studify segítségével. Hozz létre, működjetek és tanuljatok együtt egy egységes platformon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-green-500 hover:bg-green-600 text-base" size="lg" asChild>
                <Link href="/register">
                  Regisztráció
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container mx-auto px-4 py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Minden, amire szüksége van az oktatáshoz</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Erőteljes eszközök, amelyeket kifejezetten a modern oktatáshoz terveztek
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-green-400/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Kurzuskezelés</h3>
                  <p className="text-sm text-muted-foreground">
                    Szervezd meg az órákat anyagát, feladatokat és egyéb forrásokat egy helyen
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Együttműködés</h3>
                  <p className="text-sm text-muted-foreground">
                    Kapcsold össze a osztály tagjait valós idejű kommunikációval
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-green-400/10 flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Okos ütemezés</h3>
                  <p className="text-sm text-muted-foreground">
                    Soha ne hagyj ki egy határidőt se az integrált naptárral és emlékeztetőkkel
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Értékelés követése</h3>
                  <p className="text-sm text-muted-foreground">Kövesd nyomon a diákok előrehaladását és adj értékes visszajelzést</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">0</div>
              <div className="text-muted-foreground">Aktív Diák</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">0</div>
              <div className="text-muted-foreground">Beadott Anyag</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">0</div>
              <div className="text-muted-foreground">Létrehozott Poszt</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">0</div>
              <div className="text-muted-foreground">Létrehozott Tanterem</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 bg-muted/30">
          <Card className="max-w-4xl mx-auto border-green-400/20 bg-gradient-to-br from-green-400/5 to-accent/5">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Készen állsz a tantermed átalakítására?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Csatlakozz azokhoz az oktatókhoz, akik már használják a Studify-t jobb tanulási élmények eléréséhez.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-green-500 hover:bg-green-600" size="lg" asChild>
                  <Link href="/register">Csatlakozz hozzánk!</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Már van fiókom.</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-green-400 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-green-400-foreground" />
                  </div>
                  <span className="text-lg font-semibold">Studify</span>
                </div>
                <p className="text-sm text-muted-foreground">Az oktatás innoválása a technológia segítségével</p>
                <div className="mt-3">
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <Link href="#">Fülöp Miklós János</Link>
                    <Link href="#">Vadkerti-Tóth Ádám</Link>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Studify</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/" className="hover:text-foreground transition-colors">
                      Főoldal
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-foreground transition-colors">
                      Bejelentkezés
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-foreground transition-colors">
                      Kezelőfelület
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Rólunk</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="#" className="hover:text-foreground transition-colors">
                      Csapatunk
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-foreground transition-colors">
                      Dokumentáció
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Segítség</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="#" className="hover:text-foreground transition-colors">
                      Súgó Központ
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-foreground transition-colors">
                      Impresszum
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-foreground transition-colors">
                      Adatkezelési tájékoztató
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
              © 2025 Studify. Minden jog fenntartva.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}