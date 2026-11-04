import Link from "next/link";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Terms</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Terms of use</h1>
      <p className="mt-4 text-sm text-muted">Terms version 2026-11-01</p>

      <div className="mt-8 rounded-xl border border-crimson/30 bg-crimson/8 px-5 py-4 text-sm leading-relaxed text-ember">
        <strong className="text-white">Placeholder notice:</strong> this is draft product copy.
        Final legal text must be reviewed and approved by the product owner before any public
        launch.
      </div>

      <div className="prose-dark mt-8">
        <h2>What Parent Translator does</h2>
        <p>
          Parent Translator explains a school document you upload. It produces a summary, a cautious
          interpretation, a list of actions and stated deadlines, and questions you can ask the
          school. It runs one document per analysis request and keeps the result in your browser
          session only.
        </p>

        <h2>Not legal advice</h2>
        <p>
          Parent Translator is not a lawyer, an IEP advocate, a school official, or a
          decision-maker. It does not provide legal advice and does not determine your child&apos;s
          rights, services, placement, or eligibility. For decisions with legal consequences,
          consult your school district, a qualified advocate, or an attorney.
        </p>

        <h2>Verify important information</h2>
        <p>
          AI-generated explanations can be incomplete or wrong. Always check dates, services, and
          required actions against the original document and confirm them with your school. The
          brief includes source citations so you can do that.
        </p>

        <h2>Your account and the demo limit</h2>
        <p>
          You need an account to analyze a document. Each account receives three completed analyses.
          Invalid uploads do not consume a credit, and a temporary provider failure restores the
          reservation. There is no payment, upgrade, or public reset flow.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>Upload only documents you have the right to share.</li>
          <li>Do not upload another family&apos;s private records without permission.</li>
          <li>
            Do not attempt to bypass the quota, probe the service for secrets, or disrupt the demo.
          </li>
          <li>
            Do not use the app to make legal, medical, or disciplinary decisions without
            verification.
          </li>
        </ul>

        <h2>Availability</h2>
        <p>
          This is a demonstration service provided as-is, without warranties. It may be changed,
          rate-limited, or taken offline at any time. It is not a substitute for your school&apos;s
          official records or notices.
        </p>

        <h2>Privacy</h2>
        <p>
          The <Link href="/privacy">Privacy Notice</Link> explains what is processed, what is
          stored, and how to clear your session. By creating an account you confirm that you have
          read and accept both documents.
        </p>

        <h2>Changes</h2>
        <p>
          Material changes to these terms will be reflected in a new version identifier. Continuing
          to use the demo after a change means you accept the updated version.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/privacy"
          className="text-sm font-semibold text-ember underline underline-offset-4"
        >
          Privacy Notice
        </Link>
        <Link
          href="/auth/sign-up"
          className="text-sm font-semibold text-ember underline underline-offset-4"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
