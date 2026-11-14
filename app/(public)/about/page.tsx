import Link from 'next/link';

import { auth } from '@/auth';
import StaticContent from '@/component-library/static-content';

const AboutPage = async () => {
  const session = await auth();

  return (
    <StaticContent title="About Scriptural">
      <section>
        <h2>Our mission</h2>
        <p>
          Scriptural is an app for memorizing Bible verses. You type a verse, then review it again
          so you still know it later.
        </p>
      </section>

      <section>
        <h2>Features</h2>
        <h3>Spaced repetition</h3>
        <p>
          You review a verse again after a gap. The gap gets longer as the verse gets easier to
          recall.
        </p>
        <h3>Translations</h3>
        <p>Each verse is available in the ESV, the KJV, and the NASB.</p>
        <h3>Progress</h3>
        <p>
          When you finish typing a verse, Scriptural shows your grade, your mistakes, and your
          speed.
        </p>
        <h3>Community</h3>
        <p>You can share the verses you are memorizing with other people.</p>
      </section>

      <section>
        <h2>Why memorize Scripture?</h2>
        <blockquote>
          "I have hidden your word in my heart that I might not sin against you." - Psalm 119:11
        </blockquote>
        <p>
          A verse you know is one you can think about during the day. You still have the words when
          you need them, and you can say them to someone else.
        </p>
      </section>

      {session ? null : (
        <section>
          <h2>Create an account</h2>
          <p>
            <Link href="/auth/signin">Create your free account</Link> and memorize a verse.
          </p>
        </section>
      )}
    </StaticContent>
  );
};

export default AboutPage;
