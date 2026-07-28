import Link from "next/link";
export default function NotFound() { return <main className="grid min-h-screen place-items-center text-center"><div><h1 className="text-5xl font-bold">404</h1><p className="mt-3">Page not found.</p><Link className="mt-6 inline-block text-emerald-700 underline" href="/">Return home</Link></div></main>; }
