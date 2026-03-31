'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1500;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const BRIDGE_URL = 'https://images.unsplash.com/photo-1723378916181-638a68d652c5?w=1920&h=1080&fit=crop&auto=format&q=80';
const HERO_SNEAKER_URL = 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&h=800&fit=crop&auto=format&q=90';

export function HeroSection() {
  const bridgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (bridgeRef.current) {
        const scrollY = window.scrollY;
        bridgeRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ background: '#FAF7F2' }}>
      {/* Bridge background with parallax */}
      <div
        ref={bridgeRef}
        className="absolute inset-0 w-full h-[130%] -top-[15%]"
        style={{
          backgroundImage: `url(${BRIDGE_URL})`,
          backgroundSize: '140% auto',
          backgroundPosition: 'center 35%',
          opacity: 0.28,
          filter: 'saturate(0.5) brightness(1.2) contrast(0.9)',
        }}
      />

      {/* Cream vignette overlay for text readability */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 20%, #FAF7F2 75%)'
      }} />

      {/* Subtle warm glow accents */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(ellipse at 65% 30%, rgba(184, 137, 42, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 25% 75%, rgba(77, 168, 218, 0.06) 0%, transparent 50%)'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left -- Text */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-bcs-border text-xs uppercase tracking-widest text-bcs-text mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-bcs-rust animate-pulse" />
              Black Owned &bull; Portland, OR
            </div>

            {/* Heading -- outlined + filled layers */}
            <div className="relative mb-6">
              <h1 className="font-[family-name:var(--font-barlow-condensed)] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase leading-[0.9] tracking-tight">
                <span className="block text-outline-white">The Sole</span>
                <span className="block text-outline-white">of The</span>
                <span className="block" style={{
                  background: 'linear-gradient(135deg, #4DA8DA, #D4A63A)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}>City</span>
              </h1>
              {/* Shadow layer behind for depth */}
              <h1 aria-hidden="true" className="absolute top-0 left-0 font-[family-name:var(--font-barlow-condensed)] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase leading-[0.9] tracking-tight pointer-events-none -z-10 blur-[1px] opacity-30">
                <span className="block text-bcs-rust">The Sole</span>
                <span className="block text-bcs-rust">of The</span>
                <span className="block text-bcs-rust">City</span>
              </h1>
            </div>

            {/* Accent line */}
            <div className="w-20 h-1 bg-gradient-to-r from-bcs-rust to-bcs-gold rounded-full mb-6" />

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-bcs-text max-w-lg mb-8 leading-relaxed">
              Authentic sneakers &amp; streetwear. From rare finds to everyday heat, we&apos;ve got your sole covered.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="btn-rust inline-flex items-center gap-2 px-8 py-3.5 rounded-lg uppercase tracking-wide font-[family-name:var(--font-barlow-condensed)] text-lg"
              >
                Shop Now
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/store"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-bcs-border text-bcs-white font-bold uppercase tracking-wide rounded-lg hover:bg-white/50 hover:border-bcs-border2 transition-all duration-300 font-[family-name:var(--font-barlow-condensed)] text-lg"
              >
                Visit the Store
              </Link>
            </div>

            {/* Stats with animated counters */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-bcs-border">
              <div>
                <div className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold text-bcs-rust">
                  <AnimatedCounter target={500} suffix="+" />
                </div>
                <p className="text-xs text-bcs-muted uppercase tracking-wider">Styles In Store</p>
              </div>
              <div>
                <div className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold text-bcs-forest">
                  <AnimatedCounter target={100} suffix="%" />
                </div>
                <p className="text-xs text-bcs-muted uppercase tracking-wider">Authenticated</p>
              </div>
              <div>
                <div className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold text-bcs-gold">
                  <AnimatedCounter target={2200} suffix="+" />
                </div>
                <p className="text-xs text-bcs-muted uppercase tracking-wider">Pairs Sold</p>
              </div>
            </div>
          </div>

          {/* Right -- Floating Sneaker */}
          <div className="hidden lg:flex items-center justify-center relative">
            {/* Glow behind sneaker */}
            <div className="absolute w-80 h-80 rounded-full bg-bcs-rust/10 blur-[80px]" />
            <div className="absolute w-60 h-60 rounded-full bg-bcs-forest/8 blur-[60px] translate-x-20 translate-y-10" />

            {/* Floating sneaker photo */}
            <div className="relative animate-float">
              <img
                src={HERO_SNEAKER_URL}
                alt="Featured sneaker"
                className="w-[450px] h-auto rounded-2xl shadow-2xl shadow-black/30"
                style={{ transform: 'rotate(-5deg)' }}
              />
            </div>

            {/* Shadow */}
            <div className="absolute bottom-4 w-56 h-6 bg-black/15 rounded-[50%] blur-xl animate-float-shadow" />

            {/* Floating badges */}
            <div className="absolute top-8 right-4 bg-white/80 backdrop-blur-sm border border-bcs-border rounded-lg px-3 py-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8892A" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-xs font-medium text-bcs-rust">Verified</span>
              </div>
            </div>

            <div className="absolute bottom-16 left-0 bg-white/80 backdrop-blur-sm border border-bcs-border rounded-lg px-3 py-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B3FA0" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-xs font-medium text-bcs-forest">Authentic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
