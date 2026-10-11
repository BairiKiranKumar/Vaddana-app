import Image from "next/image";
import Link from "next/link";
import { getMessages } from "@/lib/i18n";

const steps = ["1", "2", "3"] as const;
const faqs = ["printer", "upi", "telugu", "offline"] as const;

export default function Home() {
  const te = getMessages("te");
  const en = getMessages("en");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-10">
      <header className="grid items-end gap-6 md:grid-cols-[1fr_16rem]">
        <div className="flex flex-col gap-4">
        <p lang="te" className="text-base font-semibold text-accent">{te["home.kicker"]}</p>
        <h1 lang="te" className="font-display text-4xl leading-heading">{te["home.title"]}</h1>
        <p lang="te" className="max-w-measure text-lg">{te["home.lede"]}</p>
        <p lang="en" className="max-w-measure text-lg text-ink-muted">{en["home.lede"]}</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/t/7" className="inline-flex min-h-primary items-center justify-center rounded-control bg-action px-4 text-lg font-semibold text-on-action">
            <span lang="te">{te["home.cta"]}</span>
          </Link>
          <Link href="/staff" className="inline-flex min-h-touch items-center rounded-control border border-line-strong bg-surface px-4 text-base font-semibold">
            <span lang="te">{te["home.staff"]}</span>
          </Link>
          <Link href="/kitchen" className="inline-flex min-h-touch items-center rounded-control border border-line-strong bg-surface px-4 text-base font-semibold">
            <span lang="te">{te["home.kitchen"]}</span>
          </Link>
          <Link href="/admin" className="inline-flex min-h-touch items-center rounded-control border border-line-strong bg-surface px-4 text-base font-semibold">
            <span lang="te">{te["home.admin"]}</span>
          </Link>
          <Link href="/t/ap1" className="inline-flex min-h-touch items-center rounded-control border border-line-strong bg-surface px-4 text-base font-semibold">
            <span lang="te">{te["home.sampleTable"]}</span>
          </Link>
          <Link href="/join" className="inline-flex min-h-touch items-center rounded-control bg-action px-4 text-base font-semibold text-on-action">
            <span lang="te">{te["home.join"]}</span>
          </Link>
          <Link href="/account" className="inline-flex min-h-touch items-center rounded-control border border-line-strong bg-surface px-4 text-base font-semibold">
            <span lang="te">{te["home.account"]}</span>
          </Link>
          <Link href="/platform" className="inline-flex min-h-touch items-center rounded-control border border-line-strong bg-surface px-4 text-base font-semibold">
            <span lang="te">{te["home.platform"]}</span>
          </Link>
        </div>
        </div>
        <Image src="/menu/chicken-biryani.jpg" alt="" width={640} height={640} priority className="aspect-square w-full rounded-sheet object-cover shadow-card" />
      </header>

      <section className="flex flex-col gap-4" aria-labelledby="how">
        <h2 id="how" lang="te" className="text-2xl font-semibold">{te["home.how"]}</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((n) => (
            <li key={n} className="flex flex-col gap-2 rounded-sheet border border-line bg-surface p-4 shadow-card">
              <p className="text-base font-semibold text-accent">{n}</p>
              <h3 lang="te" className="text-lg font-semibold">{te[`home.step${n}.title`]}</h3>
              <p lang="te" className="text-base">{te[`home.step${n}.body`]}</p>
              <p lang="en" className="text-base text-ink-muted">{en[`home.step${n}.body`]}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="faq">
        <h2 id="faq" lang="te" className="text-2xl font-semibold">{te["home.faq"]}</h2>
        {faqs.map((id) => (
          <details key={id} className="rounded-sheet border border-line bg-surface p-4 shadow-card">
            <summary className="min-h-touch cursor-pointer text-lg font-semibold">
              <span lang="te">{te[`home.faq.${id}.q`]}</span>
            </summary>
            <p lang="te" className="pt-3 text-base">{te[`home.faq.${id}.a`]}</p>
            <p lang="en" className="pt-2 text-base text-ink-muted">{en[`home.faq.${id}.a`]}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
