import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  Languages,
  Lock,
  ScanText,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const STEPS = [
  {
    icon: Upload,
    title: "Upload one document",
    body: "A report card, IEP notice, newsletter, permission slip, or teacher email. PDF, Word, image, or plain text.",
  },
  {
    icon: ScanText,
    title: "We read only that document",
    body: "The text is extracted for this request, then checked against a strict, source-grounded structure.",
  },
  {
    icon: Sparkles,
    title: "Get a brief you can act on",
    body: "Four plain-language sections, tappable jargon, and a timeline of every deadline the document states.",
  },
];

const SECTIONS = [
  {
    number: "01",
    title: "What this says",
    body: "A short summary near a 5th-grade reading level, with the grades, services, and dates kept intact.",
  },
  {
    number: "02",
    title: "What it means for your child",
    body: "A cautious interpretation that separates what the school wrote from what it may mean — never guessing.",
  },
  {
    number: "03",
    title: "What you need to do",
    body: "Concrete actions, who is responsible, and the deadline exactly as the document states it.",
  },
  {
    number: "04",
    title: "What to ask the school",
    body: "Three to five questions written for your document, plus a draft email you can copy and edit.",
  },
];

const FAQ = [
  {
    question: "Is Parent Translator free?",
    answer:
      "Yes. Every account gets three document analyses. No card, no subscription, and no upgrade path is offered.",
  },
  {
    question: "What happens to my document?",
    answer:
      "It is processed for your request and is not saved. Extracted text and results stay in your browser session only. Clearing the session removes them, and only your account email and analysis count are stored.",
  },
  {
    question: "Does this replace my school, my IEP team, or a lawyer?",
    answer:
      "No. Parent Translator explains what a document says. It does not give legal advice, decide services, predict grades, or speak for your school. For rights questions, ask your school or an official resource.",
  },
  {
    question: "Which files and languages are supported?",
    answer:
      "PDF, Word (.docx), PNG/JPG images, and plain text up to 10 MB. Output is available in English, Spanish, Vietnamese, Simplified Chinese, Arabic, and Tagalog.",
  },
  {
    question: "What if the document is unclear or a deadline is missing?",
    answer:
      "The app says so instead of inventing an answer. Ambiguous phrases like “next Friday” stay off the calendar and are shown as unclear, and citations point back to the exact source text.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-crimson/30 bg-crimson/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ember">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Built for parents, not lawyers
            </span>

            <h1 className="mt-6 text-[2.5rem] font-bold leading-[1.04] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
              School paperwork is <span className="crimson-text">overwhelming.</span>
              <br />
              We translate it into plain language.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist/85">
              Upload a report card, IEP notice, newsletter, permission slip, or teacher email. Read
              a four-part brief in your language, grounded in the document, with honest uncertainty
              and every stated deadline in one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/sign-up" className={buttonClasses("primary", "lg")}>
                Create free account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/auth/sign-in" className={buttonClasses("secondary", "lg")}>
                Sign in
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {["3 analyses per account", "No document storage", "Six languages"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-crimson" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.22),transparent_65%)] blur-2xl"
              aria-hidden="true"
            />
            <Card className="relative overflow-hidden rounded-panel p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="eyebrow">Sample preview</span>
                <span className="rounded-full border border-line bg-white/5 px-2.5 py-1 text-[10px] font-medium text-muted">
                  Synthetic data
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-line bg-abyss/80 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-crimson/15 text-crimson">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      sample-report-card.pdf
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                        aria-hidden="true"
                      />
                      3 pages detected · ready to read
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-line bg-obsidian px-3 py-2 text-xs">
                  <span className="flex items-center gap-2 text-muted">
                    <Languages className="h-4 w-4 text-crimson" aria-hidden="true" />
                    Translate brief into
                  </span>
                  <span className="font-semibold text-white">Español</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  { label: "What this says", detail: "Reading is approaching grade level." },
                  { label: "What it means", detail: "A small reading group starts this week." },
                  { label: "What you need to do", detail: "Return the signed envelope by Mar 6." },
                  { label: "What to ask", detail: "3 questions for the teacher." },
                ].map((row, index) => (
                  <div
                    key={row.label}
                    className="flex items-start gap-3 rounded-lg border border-line bg-obsidian/70 px-3 py-2.5"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-crimson/15 text-[10px] font-bold text-crimson">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">{row.label}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{row.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-crimson/25 bg-crimson/5 px-3 py-2 text-[11px] text-ember">
                <span className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  Not saved after this request
                </span>
                <span className="text-muted">3 of 3 credits</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section aria-label="Product principles" className="border-y border-line bg-abyss/40">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              icon: ShieldCheck,
              title: "Private by default",
              body: "Documents are read for one request, then dropped. No history, no training data.",
            },
            {
              icon: ScanText,
              title: "Source-grounded",
              body: "Important claims carry a short quote and page reference from your document.",
            },
            {
              icon: CalendarDays,
              title: "Deadline-safe",
              body: "Only dates the document states reach the timeline. Ambiguous wording stays ambiguous.",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-crimson/25 bg-crimson/10 text-crimson">
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">How it works</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              One document in. One clear plan out.
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              No chatbot. No open-ended advice. A fixed, auditable structure you can read in the
              time it takes to make coffee.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Card key={step.title} className="rounded-card p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-crimson/12 text-crimson">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-semibold tracking-widest text-muted">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="four-sections"
        className="border-y border-line bg-abyss/30 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">The four sections</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                The same four answers, every time.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Never missing, never renamed. If the document does not contain an answer, the brief
              says so.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <Card
                key={section.number}
                className="group rounded-card p-6 transition hover:glow-border"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-ink/60 text-xs font-bold text-ember">
                    {section.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-2">
          <Card className="rounded-panel p-7">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-crimson/12 text-crimson">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Jargon, decoded in place</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Terms like “prior written notice”, “LRE”, or “accommodation” open a one-sentence
              explanation without leaving the brief. Every definition is educational, never legal
              advice.
            </p>
            <div className="mt-5 rounded-xl border border-line bg-ink/60 p-4 text-sm leading-relaxed text-mist/85">
              The school proposes a change in services.{" "}
              <span className="underline decoration-crimson decoration-dotted underline-offset-4">
                Prior written notice
              </span>{" "}
              is required before the change takes effect.
            </div>
          </Card>

          <Card className="rounded-panel p-7">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-crimson/12 text-crimson">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">
              One timeline for the session
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Analyze several documents and their deadlines combine into one list. Each entry keeps
              its source, and a phrase like “next Friday” is never silently turned into a date.
            </p>
            <div className="mt-5 space-y-2">
              {[
                {
                  date: "Mar 6",
                  title: "Return signed report card envelope",
                  source: "report-card.pdf",
                },
                { date: "Mar 12", title: "Parent-teacher conference", source: "newsletter.pdf" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-lg border border-line bg-ink/60 px-3 py-2.5"
                >
                  <span className="w-12 shrink-0 text-xs font-semibold text-crimson">
                    {item.date}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-white">{item.title}</p>
                    <p className="truncate text-[11px] text-muted">{item.source}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="border-t border-line px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-center">Questions parents ask</p>
          <h2 className="mt-3 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Clear answers before you upload.
          </h2>

          <div className="mt-8 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-line bg-obsidian/60 px-5 py-4 open:border-crimson/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white">
                  {item.question}
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-muted transition group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-panel border border-crimson/25 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_60%)] px-6 py-14 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Get clarity on your child&apos;s documents today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
            Create an account, upload one document, and read the brief in your language. Three
            analyses are included for this demo.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/auth/sign-up" className={buttonClasses("primary", "lg")}>
              Start with one document
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/privacy" className={buttonClasses("secondary", "lg")}>
              How privacy works
            </Link>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Documents are not saved. Not legal advice.
          </p>
        </div>
      </section>
    </>
  );
}
