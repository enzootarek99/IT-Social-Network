import Link from 'next/link';

export function AdminPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0a0a0d] px-4 py-8 text-[#d0d0dc] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-sm font-semibold text-[#4f8ef7] hover:text-[#7aa8ff]">
          ← Retour admin
        </Link>
        <div className="mt-6 border-b border-[#1a1a20] pb-6">
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#e8e8f0]">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#888]">{description}</p>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
