import { ShowList } from '@/components/shows/show-list';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FooterLinks } from '@/components/layout/FooterLinks';
import { ListShowCTA } from '@/components/home/ListShowCTA';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary blur-[120px] rounded-full" />
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-orange-600 blur-[100px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
              <Zap size={14} />
              The Stage is Set
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
              EXPERIENCE THE <br />
              <span className="text-primary italic">RAW ENERGY</span> OF <br />
              LIVE COMEDY.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Discover the best comedy shows in Hyderabad. Book tickets instantly.
              Trust the vibe, enjoy the night.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/shows">
                <Button size="lg" className="h-14 px-8 text-lg font-bold gap-2 rounded-full">
                  Browse Shows
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full border-border hover:bg-muted">
                How it works
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12">
              <div className="flex flex-col items-center gap-2">
                <div className="flex text-primary">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <span className="text-sm font-bold uppercase tracking-tight">Top Rated Acts</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-primary">
                  <ShieldCheck size={32} />
                </div>
                <span className="text-sm font-bold uppercase tracking-tight">Secure Booking</span>
              </div>
              <div className="hidden md:flex flex-col items-center gap-2">
                <div className="text-primary font-black text-3xl italic">10k+</div>
                <span className="text-sm font-bold uppercase tracking-tight">Happy Fans</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Show Discovery Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase underline decoration-primary decoration-4 underline-offset-4">
                Upcoming Shows
              </h2>
              <p className="text-muted-foreground font-medium">Handpicked lineups for the ultimate laugh.</p>
            </div>
            <Link href="/shows" className="group flex items-center gap-2 text-primary font-bold uppercase text-sm tracking-widest">
              View All Shows
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <ShowList mode="discovery" />
        </div>
      </section>

      {/* Trust/Brand Section */}
      <section className="py-32 border-t border-border">
        <div className="container mx-auto px-4 text-center space-y-12">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase max-w-4xl mx-auto">
            THE PLATFORM BUILT BY <span className="text-primary">COMEDY FANS</span> FOR <span className="text-primary">COMEDY FANS</span>.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold">Velocity</h3>
              <p className="text-muted-foreground">Book your tickets in under 30 seconds. No clutter, no ads, just comedy.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-bold">Premium Selection</h3>
              <p className="text-muted-foreground">We only list shows that meet our quality standards for venue and lineup.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold">Verified Comedians</h3>
              <p className="text-muted-foreground">Know exactly who you're watching. Every comedian profile is verified by our team.</p>
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <ListShowCTA />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-black border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/symbol.png" alt="Logo" width={40} height={40} />
                <span className="font-bold text-2xl tracking-tighter">COMEDY <span className="text-primary">CONNECT</span></span>
              </Link>
              <p className="text-muted-foreground text-sm font-medium">
                The premier platform for discovering and booking live stand-up comedy shows in Hyderabad.
              </p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-primary">Navigation</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li><Link href="/shows" className="hover:text-primary transition-colors">Shows</Link></li>
                <li><Link href="/comedians" className="hover:text-primary transition-colors">Comedians</Link></li>
                <li><Link href="/venues" className="hover:text-primary transition-colors">Venues</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-primary">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-primary">For Creators</h4>
              <FooterLinks />
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <p>© 2026 Comedy Connect. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-primary transition-colors">Instagram</Link>
              <Link href="#" className="hover:text-primary transition-colors">YouTube</Link>
              <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
