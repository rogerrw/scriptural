const PrivacyPage = () => {
  return (
    <div className="fadein min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <h1 className="mb-6 text-5xl font-bold text-gray-600 dark:text-gray-300">Privacy Policy</h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-16">
          <h2 className="mb-4 text-3xl font-semibold text-gray-800 dark:text-gray-200">
            Our Commitment to Your Privacy
          </h2>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            At Scriptural, we take your privacy seriously. We understand the importance of
            protecting your personal information and are committed to being transparent about how we
            collect, use, and safeguard your data.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="mb-4 text-3xl font-semibold text-gray-800 dark:text-gray-200">
            Information We Collect
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
              Account Information
            </h3>
            <ul className="ml-6 list-disc space-y-2">
              <li>Email address (for account creation and communication)</li>
              <li>Username (for identification within the community)</li>
              <li>Password (securely hashed)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">Usage Data</h3>
            <ul className="ml-6 list-disc space-y-2">
              <li>Scripture verses you've memorized</li>
              <li>Progress tracking statistics</li>
              <li>Practice session data</li>
              <li>Device information and app preferences</li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
            How We Use Your Information
          </h2>
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800/50">
            <ul className="space-y-4 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="mt-1 block h-2 w-2 rounded-full bg-blue-500"></span>
                <span>
                  To provide and maintain our service, including tracking your progress and
                  customizing your experience
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block h-2 w-2 rounded-full bg-blue-500"></span>
                <span>To communicate with you about updates, support, and community features</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block h-2 w-2 rounded-full bg-blue-500"></span>
                <span>To improve our app based on how users interact with it</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block h-2 w-2 rounded-full bg-blue-500"></span>
                <span>To protect the security and integrity of our platform</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-4 text-3xl font-semibold text-gray-600 dark:text-gray-300">
            Data Protection
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            We implement industry-standard security measures to protect your personal information:
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800/50">
              <h3 className="mb-3 text-xl font-medium text-gray-800 dark:text-gray-200">
                Encryption
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                All data transmission between your device and our servers is encrypted using SSL/TLS
                protocols.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800/50">
              <h3 className="mb-3 text-xl font-medium text-gray-800 dark:text-gray-200">
                Secure Storage
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is stored in secure cloud infrastructure with regular security audits and
                updates.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Your Rights
          </h2>
          <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800/30">
            <ul className="space-y-4 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="mt-1 block h-2 w-2 rounded-full bg-green-500"></span>
                <span>Access and download your personal data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block h-2 w-2 rounded-full bg-green-500"></span>
                <span>Request correction of inaccurate personal data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block h-2 w-2 rounded-full bg-green-500"></span>
                <span>Delete your account and associated data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block h-2 w-2 rounded-full bg-green-500"></span>
                <span>Opt-out of non-essential communications</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Contact Us
          </h2>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            If you have any questions about this Privacy Policy or how we handle your data, please
            contact us at{' '}
            <a
              href="mailto:privacy@scriptural.app"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              privacy@scriptural.app
            </a>
          </p>
        </section>

        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-semibold">Updates to This Policy</h2>
          <p className="text-lg leading-relaxed text-white/90">
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page and updating the "Last updated" date at
            the top.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
