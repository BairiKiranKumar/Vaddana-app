import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-measure flex-col gap-4 px-4 py-16">
      <p lang="te" translate="no" className="font-display text-4xl leading-heading">వడ్డన</p>
      <h1 className="text-2xl font-semibold" translate="no">Vaddana</h1>
      <p className="text-lg text-ink-muted">The diner menu runs on sample data. Staff and admin are not built yet.</p>
      <p>
        <Link href="/t/demo" className="text-lg font-semibold text-accent underline underline-offset-4">
          Demo table
        </Link>
      </p>
      <p>
        <Link href="/preview" className="text-lg font-semibold text-accent underline underline-offset-4">
          Component preview in Telugu and English
        </Link>
      </p>
    </main>
  );
}
