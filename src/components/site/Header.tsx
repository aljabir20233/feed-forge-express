import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Search, Menu, X, User as UserIcon, LogOut, ShieldCheck } from "lucide-react";
import { fetchCategories, type Category } from "@/lib/queries";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

function bnDigits(n: number) {
  return n.toString().replace(/\d/g, (x) => "০১২৩৪৫৬৭৮৯"[+x]);
}

function bnDateNow() {
  const months = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
  const days = ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"];
  const d = new Date();
  return `${days[d.getDay()]}, ${bnDigits(d.getDate())} ${months[d.getMonth()]} ${bnDigits(d.getFullYear())}`;
}

// Bangladesh revised Bengali calendar (effective 2019)
function bnBengaliDate() {
  const d = new Date();
  const y = d.getFullYear();
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  // Month lengths starting from Boishakh
  const lengths = [31,31,31,31,31,31,30,30,30,30, isLeap ? 30 : 29, 30];
  const monthNames = ["বৈশাখ","জ্যৈষ্ঠ","আষাঢ়","শ্রাবণ","ভাদ্র","আশ্বিন","কার্তিক","অগ্রহায়ণ","পৌষ","মাঘ","ফাল্গুন","চৈত্র"];
  // Boishakh 1 = April 14
  const boishakhStart = new Date(y, 3, 14);
  let bnYear: number;
  let dayOfYear: number;
  if (d.getTime() >= boishakhStart.getTime()) {
    bnYear = y - 593;
    dayOfYear = Math.floor((d.getTime() - boishakhStart.getTime()) / 86400000);
  } else {
    const prevStart = new Date(y - 1, 3, 14);
    bnYear = y - 594;
    dayOfYear = Math.floor((d.getTime() - prevStart.getTime()) / 86400000);
  }
  let m = 0;
  let day = dayOfYear;
  while (m < 12 && day >= lengths[m]) { day -= lengths[m]; m++; }
  return `${bnDigits(day + 1)} ${monthNames[m] ?? "চৈত্র"} ${bnDigits(bnYear)}`;
}

export function Header() {
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [dateStr, setDateStr] = useState("");
  const nav = useNavigate();
  const { user, isEditor, signOut } = useAuth();

  useEffect(() => { fetchCategories().then(setCats).catch(() => {}); }, []);
  useEffect(() => { setDateStr(`${bnDateNow()} | ${bnBengaliDate()}`); }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    nav({ to: "/search", search: { q: q.trim() } });
  };

  const mainCats = cats.slice(0, 10);

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border shadow-sm">
      {/* top strip */}
      <div className="text-xs text-white" style={{ background: "linear-gradient(90deg, #c8102e 0%, #ff6a00 100%)" }}>
        <div className="news-container flex justify-between items-center py-1.5">
          <span className="opacity-95">{dateStr || "\u00A0"}</span>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isEditor && (
                  <Link to="/admin" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                    <ShieldCheck className="w-3.5 h-3.5" /> অ্যাডমিন
                  </Link>
                )}
                <button onClick={signOut} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                  <LogOut className="w-3.5 h-3.5" /> লগআউট
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <UserIcon className="w-3.5 h-3.5" /> লগইন
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* logo row */}
      <div className="news-container flex items-center justify-between py-4 gap-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="ব্যাংক বীমা খবর logo" className="h-12 md:h-14 w-auto" />
          <div className="hidden sm:block">
            <div className="font-serif text-xl md:text-2xl font-bold text-primary leading-none">ব্যাংক বীমা খবর</div>
            <div className="text-[10px] text-muted-foreground tracking-wide mt-1">A Financial Magazine Monthly</div>
          </div>
        </Link>
        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md mx-6 relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="খুঁজুন..."
            className="w-full h-10 pl-4 pr-10 rounded-full border border-input bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <button type="submit" aria-label="search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
            <Search className="w-4 h-4" />
          </button>
        </form>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* nav */}
      <nav className="bg-primary text-primary-foreground hidden md:block">
        <div className="news-container flex items-center gap-1 overflow-x-auto">
          <Link to="/" className="px-4 py-2.5 text-sm font-medium hover:bg-black/15 transition-colors whitespace-nowrap" activeProps={{ className: "px-4 py-2.5 text-sm font-medium bg-black/20 whitespace-nowrap" }} activeOptions={{ exact: true }}>হোম</Link>
          {mainCats.map((c) => (
            <Link key={c.id} to="/category/$slug" params={{ slug: c.slug }} className="px-4 py-2.5 text-sm font-medium hover:bg-black/15 transition-colors whitespace-nowrap" activeProps={{ className: "px-4 py-2.5 text-sm font-medium bg-black/20 whitespace-nowrap" }}>{c.name}</Link>
          ))}
        </div>
      </nav>

      {/* mobile nav */}
      {open && (
        <nav className="md:hidden bg-primary text-primary-foreground">
          <Link to="/" onClick={() => setOpen(false)} className="block px-4 py-2.5 border-b border-white/10 text-sm">হোম</Link>
          {cats.map((c) => (
            <Link key={c.id} to="/category/$slug" params={{ slug: c.slug }} onClick={() => setOpen(false)} className="block px-4 py-2.5 border-b border-white/10 text-sm">{c.name}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
