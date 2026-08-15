import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Shield,
  HardDrive,
  Search,
  Sparkles,
  Folder,
  Zap,
  Cloud,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

// Inline GitHub SVG (lucide-react v1.26 may not export Github)
const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

// ─── Data ──────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Cloud,
    title: "Smart Cloud Storage",
    points: ["Upload files", "Organize folders", "Drag & Drop"],
    accent: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    icon: Sparkles,
    title: "AI Document Assistant",
    points: ["Summarize files", "Explain content", "Answer questions"],
    accent: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    icon: Search,
    title: "Smart Search",
    points: ["Search files instantly", "Filter by type", "Find folders quickly"],
    accent: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    icon: Shield,
    title: "Secure Authentication",
    points: ["Google Login", "JWT Authentication", "Private storage"],
    accent: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    icon: Zap,
    title: "Access Anywhere",
    points: ["Cloud-based storage", "Responsive interface", "Fast loading"],
    accent: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    icon: Folder,
    title: "Multiple File Support",
    points: ["PDF, DOCX, PPTX", "Images, Text", "Code files"],
    accent: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
  },
];

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
];

// ─── Animation variants ────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Navbar ────────────────────────────────────────────────────────────────

const Navbar = ({ onExplore }: { onExplore: () => void }) => (
  <motion.header
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 shadow-sm"
  >
    {/* Logo */}
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="font-bold text-sm text-gray-900 tracking-tight">CloudStore</span>
    </div>

    {/* Desktop nav */}
    <nav className="hidden md:flex items-center gap-1">
      {navLinks.map((l) => (
        <a
          key={l.label}
          href={l.href}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-150"
        >
          {l.label}
        </a>
      ))}
    </nav>

    {/* Right CTAs */}
    <div className="flex items-center gap-2">
      <a
        href="https://github.com"
        target="_blank"
        rel="noreferrer"
        id="nav-github-link"
        className="hidden sm:flex items-center gap-1.5 px-3.5 h-9 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
      >
        <GithubIcon className="w-4 h-4" />
        GitHub
      </a>
      <button
        id="nav-explore-btn"
        onClick={onExplore}
        className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition-all duration-150"
      >
        Explore
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </motion.header>
);

// ─── Hero Section ──────────────────────────────────────────────────────────

const HeroSection = ({ onExplore }: { onExplore: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section id="home" ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Blue gradient orb top-right */}
        <motion.div
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(221 83% 53% / 0.12) 0%, transparent 70%)",
            y,
          }}
        />
        {/* Subtle orb bottom-left */}
        <motion.div
          className="absolute bottom-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(221 83% 53% / 0.08) 0%, transparent 70%)",
            y,
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(hsl(221 83% 53%) 1px, transparent 1px), linear-gradient(90deg, hsl(221 83% 53%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating glass cards */}
      <motion.div
        className="absolute top-1/4 right-[8%] hidden xl:flex flex-col gap-2 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg w-48"
        initial={{ opacity: 0, x: 40, y: 20 }}
        animate={{ opacity: 1, x: 0, y: [20, 0, 20] }}
        transition={{ opacity: { duration: 0.8, delay: 0.6 }, x: { duration: 0.8, delay: 0.6 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">My Drive</p>
            <p className="text-[10px] text-gray-400">24 files</p>
          </div>
        </div>
        <div className="h-px bg-gray-100" />
        {["report.pdf", "design.fig", "notes.md"].map((f) => (
          <div key={f} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-[11px] text-gray-500">{f}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-[8%] hidden xl:flex flex-col gap-3 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg w-44"
        initial={{ opacity: 0, x: -40, y: 20 }}
        animate={{ opacity: 1, x: 0, y: [0, 20, 0] }}
        transition={{ opacity: { duration: 0.8, delay: 0.8 }, x: { duration: 0.8, delay: 0.8 }, y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <p className="text-xs font-semibold text-gray-800">AI Summary</p>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          "This document contains Q3 financial projections with 12% growth…"
        </p>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full w-[78%] rounded-full bg-blue-500" />
          </div>
          <span className="text-[10px] text-gray-400">78%</span>
        </div>
      </motion.div>

      {/* Hero content */}
      <div className="relative text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-8 tracking-wide"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Smart File Management • AI Assistant • Secure Access
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.05] mb-6"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {["Your Files.", "Anywhere.", "Securely."].map((line, i) => (
            <motion.span key={line} className="block" variants={fadeUp} custom={i}>
              {i === 0 ? line : (
                <span className={i === 1 ? "text-blue-600" : ""}>{line}</span>
              )}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Your intelligent cloud workspace.{" "}
          <span className="text-gray-700 font-medium">Upload. Organize. Search. Summarize.</span>{" "}
          with your documents securely from anywhere.
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <button
            id="hero-explore-btn"
            onClick={onExplore}
            className="flex items-center gap-2 px-6 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 group"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <a
            id="hero-github-btn"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-6 h-12 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all duration-150"
          >
            <GithubIcon className="w-4 h-4" />
            View on GitHub
          </a>
        </motion.div>

        {/* Stat badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 mt-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          {[
            { emoji: "☁️", title: "Cloud Drive", subtitle: "Access Anywhere" },
            { emoji: "📂", title: "Smart Organization", subtitle: "Files & Folders" },
            { emoji: "🤖", title: "AI Chat", subtitle: "Instant Insights" },
          ].map(({ emoji, title, subtitle }) => (
            <div key={title} className="text-center px-4">
              <p className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <span>{emoji}</span>
                {title}
              </p>
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─── Features Section ──────────────────────────────────────────────────────

const FeaturesSection = () => (
  <section id="features" className="py-24 px-6 bg-white">
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
      >
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Features</p>
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
          Everything you need in one place
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          A complete file management platform built on a production-grade microservices architecture.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
      >
        {features.map(({ icon: Icon, title, points, bg, iconBg, accent }) => (
          <motion.div
            key={title}
            variants={fadeUp}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`group p-6 rounded-2xl border ${bg} cursor-default`}
          >
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-5`}>
              <Icon className={`w-5 h-5 ${accent}`} />
            </div>
            <h3 className="font-semibold text-gray-900 text-base mb-4">{title}</h3>
            <ul className="space-y-2.5">
              {points.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);


// ─── About / CTA Section ───────────────────────────────────────────────────

const AboutSection = ({ onExplore }: { onExplore: () => void }) => (
  <section id="about" className="py-24 px-6 bg-white">
    <div className="max-w-3xl mx-auto text-center">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="space-y-6"
      >
        <motion.p variants={fadeUp} className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
          About
        </motion.p>
        <motion.h2 variants={fadeUp} className="text-4xl font-bold text-gray-900 tracking-tight">
          Intelligent Cloud Storage, Reimagined
        </motion.h2>
        <motion.p variants={fadeUp} className="text-gray-500 leading-relaxed max-w-xl mx-auto">
          CloudStore combines secure file management with AI-powered productivity. Store files, organize folders, search instantly,
          generate document summaries, and interact with your content through natural conversations—all in one secure platform.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            id="about-explore-btn"
            onClick={onExplore}
            className="flex items-center gap-2 px-6 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-200 transition-all duration-150 group"
          >
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 h-11 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-600 font-medium text-sm transition-all duration-150"
          >
            <GithubIcon className="w-4 h-4" />
            Source Code
          </a>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// ─── Footer ────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="border-t border-gray-100 py-8 px-6 bg-white">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-700">CloudStore</span>
      </div>
      <p className="text-xs text-gray-400">
        AI-Powered Cloud Storage · Smart Search · Secure Authentication
      </p>
    </div>
  </footer>
);

// ─── LandingPage ──────────────────────────────────────────────────────────

const LandingPage = () => {
  const navigate = useNavigate();
  const handleExplore = () => navigate("/auth");

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar onExplore={handleExplore} />
      <HeroSection onExplore={handleExplore} />
      <FeaturesSection />
      <AboutSection onExplore={handleExplore} />
      <Footer />
    </div>
  );
};

export default LandingPage;
