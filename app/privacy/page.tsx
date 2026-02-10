'use client'

import Link from 'next/link'
import NavBar from '@/components/NavBar'

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen text-black" style={{ backgroundColor: '#7FDBFF' }}>
      <NavBar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div
          className="p-6 mb-6"
          style={{
            backgroundColor: 'white',
            border: '4px solid black',
            borderRadius: '16px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-6">Last updated: February 2024</p>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-2">What is npc?</h2>
              <p>
                npc is a thinking partner app designed to help young people develop reflection
                and critical thinking skills. We take your privacy seriously, especially since
                many of our users are teenagers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">What We Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Account info:</strong> Name (or nickname), age, interests, and goals
                  you share during signup
                </li>
                <li>
                  <strong>Conversations:</strong> Your chat messages with the AI to provide
                  the service and remember context
                </li>
                <li>
                  <strong>Check-ins:</strong> Daily check-in responses if you choose to use
                  that feature
                </li>
                <li>
                  <strong>Activity data:</strong> Basic usage info like when you use the app
                  and which features
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">What We DON'T Do</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We don't sell your data to anyone</li>
                <li>We don't show you ads</li>
                <li>We don't share your conversations with third parties (except our AI provider to make the app work)</li>
                <li>We don't track you across other websites</li>
                <li>We don't use your data to train AI models</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">How We Use Your Data</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide personalized conversations that remember your context</li>
                <li>To show you your own progress and insights</li>
                <li>To improve the app (we look at aggregate patterns, not individual conversations)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">AI & Third Parties</h2>
              <p>
                We use Anthropic's Claude AI to power conversations. Your messages are sent to
                their API to generate responses. Anthropic has their own{' '}
                <a
                  href="https://www.anthropic.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  privacy policy
                </a>
                . They do not use your conversations to train their models.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">Data Storage</h2>
              <p>
                Your data is stored securely in our database. We use industry-standard
                security practices including encryption and secure connections (HTTPS).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">Your Rights</h2>
              <p className="mb-2">You can:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Request a copy of your data</li>
                <li>Ask us to delete your account and all associated data</li>
                <li>Update your information anytime in the app</li>
              </ul>
              <p className="mt-2">
                To make any of these requests, email us at{' '}
                <a href="mailto:privacy@npc-app.com" className="text-blue-600 underline">
                  privacy@npc-app.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">Age & Parental Notice</h2>
              <p>
                npc is designed for teenagers (13+). We don't knowingly collect data from
                children under 13. If you're a parent and believe your child under 13 is
                using npc, please contact us and we'll delete their account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">Changes</h2>
              <p>
                We may update this policy occasionally. We'll notify users of significant
                changes through the app.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">Contact</h2>
              <p>
                Questions? Email us at{' '}
                <a href="mailto:hello@npc-app.com" className="text-blue-600 underline">
                  hello@npc-app.com
                </a>
              </p>
            </section>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 font-bold"
            style={{
              backgroundColor: '#FF69B4',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
