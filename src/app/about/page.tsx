export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold">About RescueNet</h1>

      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          Every year, millions of animals enter shelters across the United
          States. Many face euthanasia — not because they are unadoptable, but
          because they simply run out of time.
        </p>

        <p>
          RescueNet exists to change that. We surface the most urgent cases
          from shelters nationwide, giving at-risk animals the visibility they
          need to find rescue, foster, or adoption before their deadline.
        </p>

        <h2 className="text-xl font-semibold text-foreground pt-4">
          How It Works
        </h2>

        <ol className="list-decimal list-inside space-y-3">
          <li>
            <strong>Shelters submit listings</strong> — Animals at risk are
            posted with urgency levels and deadlines.
          </li>
          <li>
            <strong>You browse and share</strong> — Find animals in need, filter
            by species, urgency, and location.
          </li>
          <li>
            <strong>Contact the shelter</strong> — Reach out directly to foster,
            adopt, or help coordinate transport.
          </li>
        </ol>

        <h2 className="text-xl font-semibold text-foreground pt-4">
          Want to Help?
        </h2>

        <p>
          The simplest way to save a life is to share. Every share puts an
          at-risk animal in front of someone who might be their match.
        </p>
      </div>
    </div>
  );
}
