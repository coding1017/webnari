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

// Sneaker silhouette SVG
function SneakerSVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" className="w-full h-full">
      {/* Sole */}
      <path
        d="M40 160 Q40 145 60 140 L120 130 Q150 125 180 128 L280 135 Q340 140 360 150 Q370 158 360 165 L50 170 Q40 170 40 160Z"
        fill="#2A2D30"
        stroke="#D4622A"
        strokeWidth="1.5"
        opacity="0.8"
      />
      {/* Midsole */}
      <path
        d="M55 145 Q55 135 75 130 L130 118 Q160 112 190 115 L290 122 Q345 128 355 138 Q358 142 355 148 L60 152 Q55 152 55 145Z"
        fill="#353839"
        stroke="#D4622A"
        strokeWidth="1"
        opacity="0.6"
      />
      {/* Upper */}
      <path
        d="M70 130 Q65 85 90 65 Q110 50 140 48 L200 45 Q240 44 260 55 Q280 65 290 80 L310 115 Q315 125 305 128 L130 120 Q100 118 80 122 Z"
        fill="#1A1C1E"
        stroke="#D4622A"
        strokeWidth="1.5"
      />
      {/* Swoosh */}
      <path
        d="M100 105 Q140 75 200 70 Q260 65 310 90"
        fill="none"
        stroke="#D4622A"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Tongue */}
      <path
        d="M150 48 Q155 25 175 18 Q195 12 210 18 Q225 28 220 48"
        fill="#222527"
        stroke="#D4622A"
        strokeWidth="1"
        opacity="0.7"
      />
      {/* Lace holes */}
      <circle cx="165" cy="55" r="3" fill="#D4622A" opacity="0.5" />
      <circle cx="185" cy="52" r="3" fill="#D4622A" opacity="0.5" />
      <circle cx="205" cy="52" r="3" fill="#D4622A" opacity="0.5" />
      {/* Heel tab */}
      <path
        d="M85 72 Q80 60 88 52 Q96 46 105 52 Q110 60 105 72"
        fill="#D4622A"
        opacity="0.3"
      />
      {/* Accent dots */}
      <circle cx="250" cy="85" r="2" fill="#4A7C59" opacity="0.6" />
      <circle cx="270" cy="80" r="2" fill="#4A7C59" opacity="0.6" />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden grain-overlay">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-bcs-black via-bcs-dark to-bcs-black" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(ellipse at 70% 40%, rgba(212, 98, 42, 0.08) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(74, 124, 89, 0.06) 0%, transparent 50%)'
      }} />

      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 diagonal-lines" />

      {/* Grid pattern — subtle */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(237,232,227,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(237,232,227,0.5) 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left — Text */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bcs-surface/80 border border-bcs-border text-xs uppercase tracking-widest text-bcs-text mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-bcs-rust animate-pulse" />
              Black Owned &bull; Portland, OR
            </div>

            {/* Heading — outlined + filled layers */}
            <div className="relative mb-6">
              <h1 className="font-[family-name:var(--font-barlow-condensed)] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase leading-[0.9] tracking-tight">
                <span className="block text-outline-white">The Sole</span>
                <span className="block text-outline-white">of The</span>
                <span className="block text-gradient-rust">City</span>
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
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-bcs-border text-bcs-white font-bold uppercase tracking-wide rounded-lg hover:bg-bcs-surface hover:border-bcs-rust/30 transition-all duration-300 font-[family-name:var(--font-barlow-condensed)] text-lg"
              >
                Visit the Store
              </Link>
            </div>

            {/* Stats with animated counters */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-bcs-border/50">
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

          {/* Right — Floating Sneaker */}
          <div className="hidden lg:flex items-center justify-center relative">
            {/* Glow behind sneaker */}
            <div className="absolute w-80 h-80 rounded-full bg-bcs-rust/10 blur-[80px]" />
            <div className="absolute w-60 h-60 rounded-full bg-bcs-forest/8 blur-[60px] translate-x-20 translate-y-10" />

            {/* Floating sneaker */}
            <div className="relative w-[420px] h-[220px] animate-float">
              <SneakerSVG />
            </div>

            {/* Shadow */}
            <div className="absolute bottom-4 w-48 h-4 bg-bcs-rust/20 rounded-[50%] blur-md animate-float-shadow" />

            {/* Floating badges */}
            <div className="absolute top-8 right-4 bg-bcs-surface/90 backdrop-blur-sm border border-bcs-border rounded-lg px-3 py-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-xs font-medium text-bcs-forest">Verified</span>
              </div>
            </div>

            <div className="absolute bottom-16 left-0 bg-bcs-surface/90 backdrop-blur-sm border border-bcs-border rounded-lg px-3 py-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4622A" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-xs font-medium text-bcs-rust">Authentic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
