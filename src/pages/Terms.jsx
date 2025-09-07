import React from "react";

function Terms() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 text-[var(--textColor)]">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-slate-600 mb-6">
        These Terms of Service ("Terms") govern your use of Task‑Hub. By
        accessing or using the service, you agree to these Terms.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Accounts</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>You must provide accurate registration information.</li>
          <li>You are responsible for safeguarding your credentials.</li>
          <li>
            Email verification may be required to access certain features.
          </li>
          <li>
            Companies: membership can require admin approval. Your access to
            company data depends on your role and approval status.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Use of the Service</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>Do not use Task‑Hub for unlawful, harmful, or abusive activity.</li>
          <li>
            Respect others’ privacy and intellectual property. Upload only
            content you have the right to share.
          </li>
          <li>
            We may set reasonable technical limits to protect the service (e.g.,
            rate limits, storage caps).
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. Your Content</h2>
        <p className="text-slate-600">
          You own your content. By using Task‑Hub, you grant us a limited
          license to host, process, and display your content solely for the
          purpose of providing the service and its features (e.g., tasks,
          subtasks, metrics, notifications).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Privacy</h2>
        <p className="text-slate-600">
          Your use of Task‑Hub is also governed by our Privacy Policy, which
          describes what we collect and how we use it. Please review it
          carefully.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Availability and Changes</h2>
        <p className="text-slate-600">
          We aim to keep the service available and reliable, but we do not
          guarantee uninterrupted operation or any particular uptime. We may
          modify or discontinue features at any time, with reasonable notice
          where practical.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6. Termination</h2>
        <p className="text-slate-600">
          You may stop using Task‑Hub at any time. We may suspend or terminate
          your access if you violate these Terms or if required by law. Upon
          termination, we may retain or delete your data according to our
          Privacy Policy and legal obligations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">7. Disclaimers</h2>
        <p className="text-slate-600">
          Task‑Hub is provided “as is” without warranties of any kind. To the
          maximum extent permitted by law, we disclaim implied warranties of
          merchantability, fitness for a particular purpose, and non‑infringement.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">8. Limitation of Liability</h2>
        <p className="text-slate-600">
          To the extent permitted by law, we are not liable for indirect,
          incidental, special, consequential, or punitive damages, or any loss
          of data, profits, revenues, or business opportunities.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">9. Changes to These Terms</h2>
        <p className="text-slate-600">
          We may update these Terms from time to time. If changes are material,
          we will provide notice by posting an updated version and updating the
          “Last updated” date below.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
        <p className="text-slate-600">
          Questions about these Terms? Contact us at
          <a href="mailto:hello@task-hub.app" className="ml-1 text-slate-900 underline">hello@task-hub.app</a>.
        </p>
      </section>

      <div className="text-slate-500 text-sm">Last updated: {new Date().toISOString().slice(0, 10)}</div>
    </div>
  );
}

export default Terms;
