import React from "react";

function Privacy() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 text-[var(--textColor)]">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-slate-600 mb-6">
        This Privacy Policy explains what personal information Task‑Hub
        collects, why we collect it, how we use it, and the choices you have.
        We aim to be transparent and keep things simple.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Who we are</h2>
        <p className="text-slate-600">
          Task‑Hub is a company task manager that runs on Firebase
          (Authentication, Firestore, Storage) and a web frontend. You can
          contact us at <a href="mailto:hello@task-hub.app" className="text-slate-900 underline">hello@task-hub.app</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Information we collect</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>
            <span className="font-medium text-slate-800">Account data:</span>
            name, last name, email, profile photo (optional). Authentication is
            handled by Firebase Auth. We do not store raw passwords.
          </li>
          <li>
            <span className="font-medium text-slate-800">App data:</span>
            tasks, subtasks, status history, due dates, assignees, companyId,
            createdBy, timestamps (createdAt, completedAt), and counters/stats
            used to compute simple metrics.
          </li>
          <li>
            <span className="font-medium text-slate-800">Company data:</span>
            companyId, logo (optional), theme, createdBy.
          </li>
          <li>
            <span className="font-medium text-slate-800">Device/technical data:</span>
            Firebase and our hosting provider may process IP address and basic
            device or browser metadata for security, error logs, and service
            delivery.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How we use information</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>Provide and maintain the service (auth, task storage, files).</li>
          <li>Secure the app and prevent abuse or unauthorized access.</li>
          <li>Show team‑level metrics and progress (aggregated counts).</li>
          <li>Communicate important account or security notifications.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Sharing and processors</h2>
        <p className="text-slate-600 mb-2">
          We do not sell personal data. We rely on service providers to run
          Task‑Hub:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>Google Firebase (Auth, Firestore, Storage)</li>
          <li>Hosting/CDN provider (e.g., Vercel or equivalent)</li>
        </ul>
        <p className="text-slate-600 mt-2">
          These providers process data under their own terms and security
          practices.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Retention</h2>
        <p className="text-slate-600">
          We retain your account and task data while your account is active or
          as needed to provide the service. If you request deletion, we remove
          your account and related content, except where we must retain certain
          records to comply with legal obligations or resolve disputes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your rights</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>Access, correct, or update your information.</li>
          <li>Request deletion of your account and data at any time.</li>
          <li>Export a copy of your data upon request.</li>
        </ul>
        <p className="text-slate-600 mt-2">
          To exercise these rights, email
          <a href="mailto:hello@task-hub.app" className="ml-1 text-slate-900 underline">hello@task-hub.app</a> from your
          registered address and we will process the request promptly.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Children</h2>
        <p className="text-slate-600">
          Task‑Hub is not intended for children under the age of 13. We do not
          knowingly collect information from children under 13.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Changes</h2>
        <p className="text-slate-600">
          We may update this policy from time to time. We will post changes on
          this page and update the “Last updated” date below.
        </p>
      </section>

      <div className="text-slate-500 text-sm">Last updated: {new Date().toISOString().slice(0, 10)}</div>
    </div>
  );
}

export default Privacy;
