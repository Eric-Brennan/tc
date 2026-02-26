import React from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Heart,
  ShieldCheck,
  Users,
  HandCoins,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Calendar,
  MessageSquare,
  Video,
  BookOpen,
  ClipboardList,
  Lock,
  Sparkles,
  Search,
  CreditCard,
  Shield,
  Settings,
  BarChart3,
  Rss,
} from "lucide-react";

const PLATFORM_COMPARISONS = [
  { name: "BetterHelp", platformCut: "60–75%", therapistKeeps: "25–40%", source: "Reported by therapists, 2023–2024" },
  { name: "Talkspace", platformCut: "Up to ~62%", therapistKeeps: "~38%+", source: "Therapist reports & SEC filings" },
  { name: "Cerebral", platformCut: "Up to ~70%", therapistKeeps: "~30%+", source: "Therapist community estimates" },
  { name: "Therapy Connect", platformCut: "10%", therapistKeeps: "90%", highlight: true },
];

const CLIENT_FEATURES = [
  {
    icon: Search,
    title: "Find the Right Therapist",
    description:
      "Browse verified profiles filtered by specialism, location, modality and fee - no guesswork.",
  },
  {
    icon: Calendar,
    title: "Book Sessions Directly",
    description:
      "See real-time availability and book video, phone or in-person sessions in a few clicks.",
  },
  {
    icon: MessageSquare,
    title: "Secure Messaging",
    description:
      "Message your therapist between sessions. Session requests, approvals and updates all in one thread.",
  },
  {
    icon: Video,
    title: "Integrated Video Sessions",
    description:
      "Join sessions from your dashboard - no third-party links or extra software needed.",
  },
  {
    icon: ClipboardList,
    title: "Track Your Progress",
    description:
      "Complete wellbeing check-ins and see your scores over time, a simple way to notice patterns and share progress with your therapist.",
  },
  {
    icon: BookOpen,
    title: "Private Journal",
    description:
      "Reflect between sessions with a personal journal. Keep entries private or choose to share them with your therapist.",
  },
  {
    icon: CreditCard,
    title: "Transparent Pricing",
    description:
      "See therapist fees upfront. Know that 90% of what you pay goes directly to your therapist.",
  },
  {
    icon: Lock,
    title: "Your Data, Your Control",
    description:
      "We never sell your information or use it for advertising. Privacy is a right, not a feature.",
  },
  {
    icon: Users,
    title: "Follow Therapists",
    description:
      "Follow therapists to see their shared articles, insights and reflections in your feed, helpful perspectives between sessions.",
  },
];

const THERAPIST_FEATURES = [
  {
    icon: HandCoins,
    title: "Keep 90% of Every Fee",
    description:
      "Set your own session prices. We take just 10% - no hidden costs, no subscription tiers.",
  },
  {
    icon: Calendar,
    title: "Availability & Booking Control",
    description:
      "Define your working hours, session types and modalities. Clients book from your real availability.",
  },
  {
    icon: Users,
    title: "Client Management",
    description:
      "Your client backpack: session history, notes, connection status and assessments in one place.",
  },
  {
    icon: MessageSquare,
    title: "Session Requests & Messaging",
    description:
      "Approve, decline or reschedule requests. Ongoing secure messaging with clients and peers.",
  },
  {
    icon: Shield,
    title: "Supervision & CPD",
    description:
      "Built-in supervision session tracking, CPD logging, and supervisor/supervisee connections.",
  },
  {
    icon: BookOpen,
    title: "Reflective Journal",
    description:
      "A private space for clinical reflections, session notes and professional development thoughts.",
  },
  {
    icon: BarChart3,
    title: "Assessments & Outcome Data",
    description:
      "Assign standardised measures, view client scores over time, and track therapeutic progress.",
  },
  {
    icon: Settings,
    title: "No Micro Management",
    description:
      "We don't pester you on response times - your clients are your responsibility.",
  },
  {
    icon: Rss,
    title: "Share Insights & Articles",
    description:
      "Post thoughts, useful articles and reflections that appear in your clients' feeds, a simple way to add value between sessions.",
  },
];

const PRINCIPLES = [
  "Therapists set their own fees - we never dictate pricing",
  "No non-compete clauses. Leave whenever you like and take your clients",
  "Client data is never sold, mined or used for targeted advertising",
  "Open, transparent fee structure - 10% platform fee, nothing hidden",
  "Built by people who believe therapy should be accessible, not exploitative",
  "We actively support pro-bono and reduced-fee work through token credits",
];

export default function About() {
  const navigate = useNavigate();
  const [featureTab, setFeatureTab] = React.useState<"client" | "therapist">("client");

  const activeFeatures = featureTab === "client" ? CLIENT_FEATURES : THERAPIST_FEATURES;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* ── Navigation bar ── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">
              Therapy Connect
            </span>
          </button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate("/login")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">A new kind of platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Therapy Connect
          </h1>

          <p className="mt-4 text-xl sm:text-2xl text-muted-foreground font-medium tracking-tight">
            Ethical, not corporate
          </p>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Many popular therapy platforms reportedly take over 60% of what clients pay - leaving
            therapists underpaid and overworked. Therapy Connect takes just{" "}
            <span className="font-semibold text-foreground">10%</span>, because
            connecting people with the right support shouldn't come at an
            exploitative cost.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Button
              size="lg"
              className="gap-2 px-8"
              onClick={() => navigate("/login")}
            >
              Join Therapy Connect
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 px-8"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="py-16 sm:py-24 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Where does your money actually go?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              On the biggest therapy platforms, a significant portion of every session fee
              reportedly goes to the company - not the therapist providing your care.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORM_COMPARISONS.map((p) => (
              <Card
                key={p.name}
                className={`p-6 text-center transition-all ${
                  p.highlight
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20 shadow-lg scale-[1.02]"
                    : "bg-card"
                }`}
              >
                <h3
                  className={`font-semibold text-lg ${
                    p.highlight ? "text-primary" : "text-foreground"
                  }`}
                >
                  {p.name}
                </h3>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Platform takes
                    </p>
                    <p
                      className={`text-2xl font-bold mt-1 ${
                        p.highlight ? "text-green-600 dark:text-green-400" : "text-destructive"
                      }`}
                    >
                      {p.platformCut}
                    </p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Therapist keeps
                    </p>
                    <p
                      className={`text-2xl font-bold mt-1 ${
                        p.highlight
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {p.therapistKeeps}
                    </p>
                  </div>
                </div>

                {p.highlight && (
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    Fair for everyone
                  </div>
                )}

                {"source" in p && p.source && (
                  <p className="mt-3 text-[11px] text-muted-foreground/60 italic leading-snug">
                    {p.source}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="py-16 sm:py-24 bg-muted/30 border-t border-border/30"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Everything you need, nothing you don't
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Therapy Connect gives therapists real tools to run their practice - and
              gives clients a straightforward way to find and work with the right
              person.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-full bg-muted p-1 gap-1">
              <button
                onClick={() => setFeatureTab("client")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  featureTab === "client"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  For Clients
                </span>
              </button>
              <button
                onClick={() => setFeatureTab("therapist")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  featureTab === "therapist"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <HandCoins className="w-4 h-4" />
                  For Therapists
                </span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeFeatures.map((f) => (
              <Card key={f.title} className="p-6 bg-card hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  featureTab === "client"
                    ? "bg-blue-500/10"
                    : "bg-emerald-500/10"
                }`}>
                  <f.icon className={`w-5 h-5 ${
                    featureTab === "client"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Principles ── */}
      <section className="py-16 sm:py-24 border-t border-border/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            <div className="lg:w-2/5 lg:sticky lg:top-24">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Our principles
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We built Therapy Connect because we were tired of platforms that treat
                therapists as interchangeable content creators and clients as
                subscription revenue. Here's what we stand for.
              </p>
            </div>

            <div className="lg:w-3/5 space-y-4">
              {PRINCIPLES.map((principle, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <p className="text-foreground leading-relaxed">{principle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What we DON'T do ── */}
      <section className="py-16 sm:py-24 border-t border-border/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            <div className="lg:w-2/5 lg:sticky lg:top-24">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                What we <span className="italic">don't</span> do
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We think what a platform chooses <span className="italic">not</span> to do matters
                just as much as what it offers. These are the industry practices
                we refuse to adopt.
              </p>
            </div>

            <div className="lg:w-3/5 space-y-4">
              {[
                "Take the majority of session fees",
                "Lock therapists into non-compete agreements",
                "Sell or monetise client data",
                "Use algorithms to assign therapists for profit",
                "Hide fees behind complex subscription tiers",
                "Pressure therapists into unsustainable caseloads",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-destructive/20 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  <p className="text-foreground leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 bg-primary/5 border-t border-border/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Ready to try something different?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
            Join a growing community of therapists and clients who believe mental
            health support should be ethical, transparent, and fair.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Button
              size="lg"
              className="gap-2 px-8"
              onClick={() => navigate("/login")}
            >
              Create Your Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free to join. 10% platform fee on sessions only. No hidden costs.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="w-3.5 h-3.5" />
            <span>&copy; {new Date().getFullYear()} Therapy Connect. Ethical, not corporate.</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/login")}
              className="hover:text-foreground transition-colors"
            >
              Sign In
            </button>
            <span className="text-border">|</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-foreground transition-colors"
            >
              Back to Top
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}