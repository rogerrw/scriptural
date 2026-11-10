import StaticContent from '@/component-library/static-content';

const PrivacyPage = () => {
  return (
    <StaticContent title="Privacy Policy">
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <section>
        <h2>Our Commitment to Your Privacy</h2>
        <p>
          At Scriptural, we take your privacy seriously. We understand the importance of protecting
          your personal information and are committed to being transparent about how we collect,
          use, and safeguard your data.
        </p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <h3>Account Information</h3>
        <ul>
          <li>Email address (for account creation and communication)</li>
          <li>Username (for identification within the community)</li>
          <li>Password (securely hashed)</li>
        </ul>
        <h3>Usage Data</h3>
        <ul>
          <li>Scripture verses you've memorized</li>
          <li>Progress tracking statistics</li>
          <li>Practice session data</li>
          <li>Device information and app preferences</li>
        </ul>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <ul>
          <li>
            To provide and maintain our service, including tracking your progress and customizing
            your experience
          </li>
          <li>To communicate with you about updates, support, and community features</li>
          <li>To improve our app based on how users interact with it</li>
          <li>To protect the security and integrity of our platform</li>
        </ul>
      </section>

      <section>
        <h2>Data Protection</h2>
        <p>
          We implement industry-standard security measures to protect your personal information:
        </p>
        <h3>Encryption</h3>
        <p>
          All data transmission between your device and our servers is encrypted using SSL/TLS
          protocols.
        </p>
        <h3>Secure Storage</h3>
        <p>
          Your data is stored in secure cloud infrastructure with regular security audits and
          updates.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <ul>
          <li>Access and download your personal data</li>
          <li>Request correction of inaccurate personal data</li>
          <li>Delete your account and associated data</li>
          <li>Opt-out of non-essential communications</li>
        </ul>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or how we handle your data, please
          contact us at <a href="mailto:privacy@scriptural.app">privacy@scriptural.app</a>
        </p>
      </section>

      <section>
        <h2>Updates to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy on this page and updating the "Last updated" date at the
          top.
        </p>
      </section>
    </StaticContent>
  );
};

export default PrivacyPage;
