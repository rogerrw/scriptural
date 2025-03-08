import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="fadein min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <h1 className="mb-6 text-5xl font-bold text-gray-600 dark:text-gray-300">
          About Scriptural
        </h1>

        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-semibold">Our Mission</h2>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Scriptural is a modern Bible verse memorization app designed to help you internalize and
            retain God's Word. We believe that hiding Scripture in your heart is a transformative
            practice that deepens your faith and strengthens your spiritual journey.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-semibold">Key Features</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="group rounded-xl bg-white p-8 shadow-md transition-all hover:shadow-lg dark:bg-gray-800/50 dark:shadow-gray-900/30">
              <h3 className="mb-3 text-2xl font-medium text-gray-900 dark:text-white">
                Smart Learning System
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our spaced repetition algorithm helps you memorize verses efficiently by reviewing
                them at optimal intervals.
              </p>
            </div>
            <div className="group rounded-xl bg-white p-8 shadow-md transition-all hover:shadow-lg dark:bg-gray-800/50 dark:shadow-gray-900/30">
              <h3 className="mb-3 text-2xl font-medium text-gray-900 dark:text-white">
                Multiple Translations
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Study and memorize verses from various Bible translations to deepen your
                understanding.
              </p>
            </div>
            <div className="group rounded-xl bg-white p-8 shadow-md transition-all hover:shadow-lg dark:bg-gray-800/50 dark:shadow-gray-900/30">
              <h3 className="mb-3 text-2xl font-medium text-gray-900 dark:text-white">
                Progress Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your memorization journey with detailed statistics and progress indicators.
              </p>
            </div>
            <div className="group rounded-xl bg-white p-8 shadow-md transition-all hover:shadow-lg dark:bg-gray-800/50 dark:shadow-gray-900/30">
              <h3 className="mb-3 text-2xl font-medium text-gray-900 dark:text-white">
                Community Support
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with other believers and share your memorization goals and achievements.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16 rounded-xl bg-gray-50 p-8 dark:bg-gray-800/30">
          <h2 className="mb-6 text-3xl font-semibold">Why Memorize Scripture?</h2>
          <blockquote className="mb-6 border-l-4 border-gray-300 pl-6 text-lg italic text-gray-600 dark:border-gray-600 dark:text-gray-300">
            "I have hidden your word in my heart that I might not sin against you." - Psalm 119:11
          </blockquote>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Scripture memorization helps us meditate on God's truth throughout the day, provides
            comfort in times of need, equips us to share our faith, and transforms our minds to
            align with God's will.
          </p>
        </section>

        <section className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-8 text-white">
          <h2 className="mb-6 text-3xl font-semibold">Get Started Today</h2>
          <p className="text-lg leading-relaxed text-white/90">
            Join thousands of believers who are growing in their faith through Scripture
            memorization.{' '}
            <Link className="underline" href="/auth/signin">
              Create your free account
            </Link>{' '}
            and begin your journey of hiding God's Word in your heart.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
