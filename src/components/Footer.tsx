import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Globe2, Mail, MapPin, Send, Shield } from "lucide-react";

const ZONES = [
  "North Central",
  "North East",
  "North West",
  "South East",
  "South South",
  "South West",
];

export default function Footer({ onOpenTipModal }: { onOpenTipModal: () => void }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-red-600 bg-[#07172c] pb-8 pt-12 text-slate-300">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-9 border-b border-slate-800 pb-9 md:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow">
                <Image
                  src="/delta-updates-icon.png"
                  alt="Delta Updates logo"
                  width={466}
                  height={401}
                  className="h-full w-auto object-contain"
                />
              </span>
              <span>
                <span className="block font-serif text-xl font-bold tracking-tight text-white">Delta <span className="font-sans uppercase text-red-400">Updates</span></span>
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-blue-300">Independent local journalism · Nationwide</span>
              </span>
            </div>
            <p className="max-w-md text-xs leading-6 text-slate-400">
              Rooted in Delta State and open to every Nigerian community. We bring local voices, useful reporting and verified stories closer to the people they affect.
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0 text-red-400" /><span>Founding editorial desk · Delta State, Nigeria</span></p>
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0 text-blue-300" /><span>newsroom@deltaupdates.ng</span></p>
            </div>
          </div>

          <div className="space-y-3 lg:col-span-3">
            <h2 className="border-l-2 border-red-500 pl-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white">News desks</h2>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>National news & public affairs</li>
              <li>Business & economy</li>
              <li>Cities & communities</li>
              <li>Energy & environment</li>
              <li>Security, sports & culture</li>
              <li className="font-semibold text-blue-200">Delta & Niger Delta regional desk</li>
            </ul>
          </div>

          <div className="space-y-3 lg:col-span-3">
            <h2 className="border-l-2 border-red-500 pl-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white">Nigeria coverage</h2>
            <p className="flex items-center gap-2 text-xs font-semibold text-blue-100"><Globe2 className="h-4 w-4 text-red-400" />Open to all 36 states + FCT</p>
            <div className="flex flex-wrap gap-1.5">
              {ZONES.map((zone) => <span key={zone} className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-1 text-[10px] font-medium text-slate-300">{zone}</span>)}
            </div>
            <p className="text-[10px] leading-4 text-slate-500">Our Delta State desk is the starting point of a growing nationwide local-news network.</p>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <h2 className="border-l-2 border-red-500 pl-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white">Join the network</h2>
            <p className="text-[11px] leading-5 text-slate-400">Have a verified story or a community issue that needs attention? Send it to our editorial team from anywhere in Nigeria.</p>
            <button type="button" onClick={onOpenTipModal} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700">
              <Send className="h-3.5 w-3.5" /> Send a news tip
            </button>
            <Link href="/admin" className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-blue-200 transition hover:border-slate-500 hover:text-white">
              <Shield className="h-3.5 w-3.5" /> Newsroom CMS <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-5 text-[10px] text-slate-500 sm:flex-row">
          <p>© {currentYear} Delta Updates Media Network. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span>Independent reporting</span><span aria-hidden="true">·</span><span>Community first</span><span aria-hidden="true">·</span><Link href="/admin" className="text-blue-300 transition hover:text-white">Editorial workspace</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
