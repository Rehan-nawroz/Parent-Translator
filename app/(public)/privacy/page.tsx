import Link from "next/link";

import { Card } from "@/components/ui/Card";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Privacy</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">What happens to your document</h1>
      <p className="mt-4 text-sm text-muted">Privacy notice version 2026-11-01</p>

      <Card className="mt-8 rounded-card p-5">
        <p className="text-sm leading-relaxed text-mist/90">
          <strong className="text-white">The short version:</strong> your document is read for one
          request and is not saved. Results live in your browser session until you clear them. The
          only product records we keep are your account email, policy acceptance, and how many
          analyses you have used.
        </p>
      </Card>

      <div className="prose-dark mt-8">
        <h2>What we process</h2>
        <p>
          When you upload a document, the file is used to extract text or to read the page through
          the analysis model. The extracted content is sent to Google Gemini for that single request
          so it can produce the four-part brief. Source quotes are returned to your browser as part
          of the result.
        </p>

        <h2>What we do not save</h2>
        <ul>
          <li>Uploaded files are not written to permanent storage.</li>
          <li>Extracted text is held only for the active request and then dropped.</li>
          <li>
            Analysis results and the timeline are kept in browser memory for the session only.
          </li>
          <li>We do not use document content for training, advertising, or analytics.</li>
          <li>
            We do not store child names, school records, student IDs, or document text in the
            database.
          </li>
        </ul>

        <h2>What Supabase stores</h2>
        <p>
          Authentication is handled by Supabase. The project stores the minimum metadata needed to
          run the service:
        </p>
        <ul>
          <li>Your account identity (email address and Supabase user ID).</li>
          <li>The Terms and Privacy versions you accepted, with a timestamp.</li>
          <li>
            A quota record containing your user ID, the number of successful analyses, any
            temporarily reserved analysis, and timestamps.
          </li>
        </ul>
        <p>
          That quota record never contains document text, filenames, prompts, or model output. It is
          reachable only through protected server functions.
        </p>

        <h2>Session data</h2>
        <p>
          Results stay in the open tab. Clearing the session removes them and the combined timeline
          from memory. Closing the tab also discards the results. Clearing the session does not
          reset the three-analysis account limit.
        </p>

        <h2>Service providers</h2>
        <p>
          Supabase provides authentication and the minimal quota/consent records. Google Gemini
          processes the document content for the analysis request. Both are used only to deliver
          this product experience.
        </p>

        <h2>Your choices</h2>
        <p>
          You can clear the active session at any time from the dashboard, result, or account
          screen. You can sign out from any protected screen. If you need your account removed,
          contact the project owner through the repository where this demo is published.
        </p>

        <h2>Limits</h2>
        <p>
          This notice describes a demonstration, not a production service. It is written to be
          accurate about the current implementation; it is not legal advice. Final legal review is
          required before any public launch.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/terms"
          className="text-sm font-semibold text-ember underline underline-offset-4"
        >
          Read the terms
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
