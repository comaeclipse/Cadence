export const metadata = {
  title: "Privacy Policy — BehaviorTracker",
  description: "Privacy policy for the BehaviorTracker app.",
};

export default function PrivacyPage() {
  const lastUpdated = "April 29, 2025";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: {lastUpdated}</p>

      <section className="mb-8">
        <p>
          BehaviorTracker (&quot;the App&quot;) is a caregiving tool designed to help
          professionals and families log, monitor, and analyze behavioral and
          health-related observations for children in their care. This Privacy
          Policy explains what information the App collects, how it is used, and
          how it is protected.
        </p>
        <p className="mt-3">
          By using the App, you agree to the practices described in this policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
        <p className="mb-3">
          The App collects only the information you explicitly enter. No
          information is collected automatically beyond what is necessary to
          operate the App.
        </p>
        <p className="mb-2">This includes:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>
            <span className="font-medium">Account information</span> — a username
            and password you create when registering. Passwords are never stored
            in plaintext; they are hashed using bcrypt before being saved.
          </li>
          <li>
            <span className="font-medium">Child profile information</span> — such as
            name and date of birth, used to associate logged observations with a
            specific child.
          </li>
          <li>
            <span className="font-medium">Behavioral observations</span> — details
            about behavioral incidents you choose to record, including timing,
            context, and outcomes.
          </li>
          <li>
            <span className="font-medium">Health and daily living observations</span>{" "}
            — nutritional intake and other health-related logs you choose to
            record.
          </li>
          <li>
            <span className="font-medium">Notes and attachments</span> — any
            free-text notes or media files you attach to a record.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
        <p className="mb-2">Information you enter is used solely to:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Display your logged observations within the App</li>
          <li>Generate summaries, charts, and trend analysis</li>
          <li>Produce reports that you can save or share</li>
        </ul>
        <p className="mt-3">
          We do not use your data for advertising, profiling, or any purpose
          beyond operating the App for you.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Data Storage &amp; Security</h2>
        <p>
          All data you enter is stored in a secure, cloud-hosted database
          provided by{" "}
          <a
            href="https://neon.tech"
            className="text-emerald-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Neon
          </a>
          . Data is transmitted over encrypted HTTPS connections and stored in
          the United States. You can review Neon&apos;s privacy practices at{" "}
          <a
            href="https://neon.tech/privacy-policy"
            className="text-emerald-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            neon.tech/privacy-policy
          </a>
          .
        </p>
        <p className="mt-3">
          Sensitive data fields are encrypted at rest using AES-256-GCM
          encryption. Passwords are hashed and are never stored or transmitted
          in plaintext.
        </p>
        <p className="mt-3">
          When you log in, a session is stored in your browser&apos;s local storage
          and expires automatically after 7 days. No cookies are used for
          authentication.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Third-Party Services</h2>
        <p className="mb-2">The App uses the following third-party services:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <span className="font-medium">Neon</span> — managed cloud database
            hosting.
          </li>
          <li>
            <span className="font-medium">Google Fonts</span> — fonts are loaded from
            Google&apos;s CDN. Google may log font requests per their{" "}
            <a
              href="https://policies.google.com/privacy"
              className="text-emerald-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacy policy
            </a>
            .
          </li>
        </ul>
        <p className="mt-3">
          There are no advertising networks, analytics platforms, or social media
          trackers embedded in the App.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Exported Reports</h2>
        <p>
          The App can generate PDF reports from your logged data. These reports
          are created locally in your browser and are not transmitted to any
          server. You are responsible for securing any reports you save or share.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Data Deletion</h2>
        <p>
          You can delete individual records directly within the App at any time.
          You can also permanently delete your entire account and all associated
          data from <strong>Settings → Delete Account</strong>. Account deletion
          requires password confirmation and immediately and irreversibly removes
          all child profiles, observations, and logs tied to your account.
          Deleted data cannot be recovered.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Data Sharing</h2>
        <p>
          We do not sell, rent, or share your data with any third party for
          commercial purposes. Data is not disclosed to any party other than the
          infrastructure providers necessary to operate the App.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Data Related to Minors</h2>
        <p>
          The App is intended for use by caregivers, educators, and behavioral
          health professionals. All observations logged in the App are entered by
          an adult on behalf of a child in their care. The App is not directed at
          children and does not collect information directly from them.
        </p>
        <p className="mt-3">
          Because the App may store sensitive health-related information about
          minors, we treat this data with particular care. It is used solely to
          support the child&apos;s caregiving team and is never used for commercial
          purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
        <p>
          If you have questions about this Privacy Policy or would like to
          request deletion of your data, please contact:
        </p>
        <p className="mt-3 font-medium">[Your name or organization]</p>
        <p className="text-gray-700">[your@email.com]</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we
          will revise the &quot;Last updated&quot; date at the top of this page. Continued
          use of the App after changes are posted constitutes acceptance of the
          updated policy.
        </p>
      </section>
    </div>
  );
}
