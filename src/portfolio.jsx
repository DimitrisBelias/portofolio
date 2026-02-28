import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Animated Star Field ─── */
function StarField() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const starsRef = useRef([]);
  const animRef = useRef(null);

  const initStars = useCallback((w, h) => {
    const count = Math.floor((w * h) / 4000);
    starsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 3 + 0.5,
      baseOpacity: Math.random() * 0.6 + 0.15,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    initStars(w, h);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initStars(w, h);
    };

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t++;

      // Subtle radial glow near mouse
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 220);
      grad.addColorStop(0, "rgba(245, 158, 11, 0.015)");
      grad.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (const star of starsRef.current) {
        // Parallax drift based on scroll
        const scrollY = window.scrollY;
        const yOffset = (scrollY * star.z * 0.04) % h;
        const drawY = (star.y + yOffset) % h;

        // Twinkle
        const twinkle = Math.sin(t * star.twinkleSpeed + star.phase) * 0.3 + 0.7;
        const opacity = star.baseOpacity * twinkle;

        // Proximity glow
        const dx = mx - star.x;
        const dy = my - drawY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = dist < 180 ? (1 - dist / 180) * 0.5 : 0;

        const radius = star.z * 0.8;
        const finalOpacity = Math.min(opacity + proximity, 1);

        ctx.beginPath();
        ctx.arc(star.x, drawY, radius, 0, Math.PI * 2);
        ctx.fillStyle =
          proximity > 0.05
            ? `rgba(245, 180, 60, ${finalOpacity})`
            : `rgba(220, 220, 230, ${finalOpacity})`;
        ctx.fill();
      }

      // Occasional shooting star
      if (Math.random() < 0.002) {
        const sx = Math.random() * w;
        const sy = Math.random() * h * 0.5;
        const len = Math.random() * 80 + 40;
        const sGrad = ctx.createLinearGradient(sx, sy, sx + len, sy + len * 0.4);
        sGrad.addColorStop(0, "rgba(245, 180, 60, 0.6)");
        sGrad.addColorStop(1, "rgba(245, 180, 60, 0)");
        ctx.strokeStyle = sGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + len, sy + len * 0.4);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [initStars]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #0c0c14 0%, #050507 70%)" }}
    />
  );
}

/* ─── Comet Trail Cursor ─── */
function CometCursor() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: -100, y: -100 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const handleMouse = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      // Spawn particles on movement
      for (let i = 0; i < 3; i++) {
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 4,
          y: e.clientY + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 + 0.5,
          life: 1,
          decay: Math.random() * 0.025 + 0.015,
          size: Math.random() * 2.5 + 0.5,
          hue: Math.random() > 0.3 ? 38 : 45, // amber range
        });
      }
      // Cap particle count
      if (particles.current.length > 150) {
        particles.current = particles.current.slice(-150);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw comet head (small glow at cursor)
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const headGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 12);
      headGrad.addColorStop(0, "rgba(245, 180, 60, 0.8)");
      headGrad.addColorStop(0.4, "rgba(245, 158, 11, 0.3)");
      headGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = headGrad;
      ctx.fillRect(mx - 12, my - 12, 24, 24);

      // Update & draw particles
      particles.current = particles.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= p.decay;

        if (p.life <= 0) return false;

        const alpha = p.life * 0.7;
        const size = p.size * p.life;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${alpha})`;
        ctx.fill();

        // Soft glow around larger particles
        if (p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${alpha * 0.15})`;
          ctx.fill();
        }

        return true;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 60 }}
    />
  );
}

const SECTIONS = ["about", "projects", "skills", "terminal"];

const PROJECTS = [
  {
    title: "Smart Factory Robot Analyzer",
    description: "Aggregative analysis system for ~10M robot movement records in a simulated smart factory. Implements 9 query types (speed, collisions, deadlocks, cosine similarity, proximity) using the Strategy Pattern. Includes profiling-guided refactoring with file-based caching and sqrt elimination.",
    tags: ["Python", "OOP", "Strategy Pattern", "Profiling", "Bash"],
    link: "#",
  },
  {
    title: "University Secretary Bot",
    description: "Telegram bot integrated with Notion for managing assignments, labs, and projects. Features a finite state machine with 20+ conversation states, inline button UI, CRUD operations across 4 Notion databases, and cloud deployment.",
    tags: ["Python", "Telegram API", "Notion API", "Cloud Deploy"],
    link: "#",
  },
  {
    title: "TinyOS-3 Kernel Extensions",
    description: "Extended a minimal OS kernel with multithreaded processes, MLFQ priority scheduling, pipes (bounded circular buffer IPC), sockets (Listen/Accept/Connect), and a process info API. Written in C11 targeting a simulated multicore machine.",
    tags: ["C", "OS Kernel", "Concurrency", "IPC"],
    link: "#",
  },
  {
    title: "Bank of TUC — eBanking System",
    description: "Full-stack banking simulation with CLI and JavaFX GUI. Features user auth, SEPA/SWIFT transfers via external API, bill management, standing orders, time simulation, and interest accrual. Architected with 6 design patterns: Singleton, Factory, Builder, Command, Bridge, and DAO.",
    tags: ["Java", "JavaFX", "Design Patterns", "REST API", "CSV Persistence"],
    link: "#",
  },
];

const SKILLS = {
  Languages: ["Java", "C", "Python", "MATLAB", "MIPS Assembly", "RISC-V", "VHDL", "Bash", "SQL"],
  Frameworks: ["Spring Boot", "NumPy", "TinyOS", "JUnit"],
  Tools: ["Git", "Docker", "Oracle Cloud", "Linux", "Notion API"],
  Concepts: ["OOP & Design Patterns", "OS Internals", "Networking", "Digital Systems", "Data Structures & Algorithms"],
};

const SOCIAL = {
  github: "https://github.com/DimitrisBelias/",
  linkedin: "https://www.linkedin.com/in/beliasdimitris",
  email: "mailto:dimitris.outlook.com",
};

/* ─── Animated Section Hook ─── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── Components ─── */

function Navbar({ active }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/50" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
        <a href="#hero" className="font-mono text-sm tracking-widest text-neutral-400 hover:text-amber-400 transition-colors">
          DB<span className="text-amber-400">.</span>
        </a>
        <div className="flex gap-8">
          {SECTIONS.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              className={`text-xs tracking-widest uppercase transition-colors duration-300 ${
                active === s ? "text-amber-400" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-6">
        <p
          className={`font-mono text-xs tracking-[0.35em] uppercase text-amber-400/80 mb-6 transition-all duration-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Electrical &amp; Computer Engineer
        </p>
        <h1
          className={`text-5xl sm:text-7xl md:text-8xl font-extralight tracking-tight text-neutral-100 mb-4 transition-all duration-700 delay-150 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Dimitris<span className="text-amber-400 font-light">.</span>
          <br />
          Belias
        </h1>
        <p
          className={`text-neutral-500 text-sm sm:text-base max-w-md mx-auto mt-6 leading-relaxed transition-all duration-700 delay-300 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Backend-focused developer with a passion for systems programming,
          distributed architectures, and clean software design.
        </p>
        <div
          className={`mt-10 transition-all duration-700 delay-500 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <a
            href="#projects"
            className="inline-block border border-neutral-700 text-neutral-400 text-xs tracking-widest uppercase px-8 py-3 hover:border-amber-400/60 hover:text-amber-400 transition-all duration-300"
          >
            View Work
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-neutral-600 to-transparent animate-pulse" />
      </div>
    </section>
  );
}

function About() {
  const [ref, visible] = useReveal();
  return (
    <section id="about" className="py-32 px-6">
      <div ref={ref} className={`max-w-3xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-amber-400/70 mb-8">About</p>
        <h2 className="text-3xl sm:text-4xl font-extralight text-neutral-200 mb-8 leading-snug" style={{ fontFamily: "'Syne', sans-serif" }}>
          Building robust systems<span className="text-amber-400">.</span>
        </h2>
        <div className="space-y-5 text-neutral-400 leading-relaxed text-sm sm:text-base">
          <p>
            I'm a Computer Science undergraduate at the Technical University of Crete,
            driven by a deep curiosity for how software systems work under the hood — from
            operating system kernels to enterprise backend architectures.
          </p>
          <p>
            My work spans Java enterprise applications, systems programming in C, digital
            design with VHDL, and full-stack development. I enjoy tackling complex
            problems that require both theoretical depth and practical engineering.
          </p>

        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }) {
  const [ref, visible] = useReveal();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative border border-neutral-800/60 p-8 transition-all duration-700 cursor-pointer ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Corner accent */}
      <div className={`absolute top-0 left-0 w-8 h-px bg-amber-400 transition-all duration-500 ${hovered ? "w-16" : "w-8"}`} />
      <div className={`absolute top-0 left-0 h-8 w-px bg-amber-400 transition-all duration-500 ${hovered ? "h-16" : "h-8"}`} />

      <p className="font-mono text-xs text-neutral-600 mb-4">0{index + 1}</p>
      <h3
        className="text-xl font-light text-neutral-200 mb-3 group-hover:text-amber-400 transition-colors duration-300"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {project.title}
      </h3>
      <p className="text-neutral-500 text-sm leading-relaxed mb-6">{project.description}</p>
      <div className="flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <span key={t} className="text-xs font-mono px-2.5 py-1 border border-neutral-800 text-neutral-500">
            {t}
          </span>
        ))}
      </div>

      {/* Arrow */}
      <div className={`absolute bottom-8 right-8 text-amber-400 transition-all duration-300 ${hovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

function Projects() {
  const [ref, visible] = useReveal();
  return (
    <section id="projects" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div ref={ref} className={`mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-amber-400/70 mb-4">Projects</p>
          <h2 className="text-3xl sm:text-4xl font-extralight text-neutral-200" style={{ fontFamily: "'Syne', sans-serif" }}>
            Selected work<span className="text-amber-400">.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Skills() {
  const [ref, visible] = useReveal();
  return (
    <section id="skills" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div ref={ref} className={`mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-amber-400/70 mb-4">Skills</p>
          <h2 className="text-3xl sm:text-4xl font-extralight text-neutral-200" style={{ fontFamily: "'Syne', sans-serif" }}>
            Tech stack<span className="text-amber-400">.</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {Object.entries(SKILLS).map(([category, items], ci) => {
            const [cRef, cVis] = useReveal();
            return (
              <div
                key={category}
                ref={cRef}
                className={`transition-all duration-700 ${cVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: `${ci * 100}ms` }}
              >
                <h3 className="font-mono text-xs tracking-widest uppercase text-neutral-500 mb-5 pb-2 border-b border-neutral-800/50">
                  {category}
                </h3>
                <ul className="space-y-2.5">
                  {items.map((s) => (
                    <li key={s} className="text-sm text-neutral-400 flex items-center gap-2.5 group cursor-default">
                      <span className="w-1 h-1 bg-amber-400/50 group-hover:bg-amber-400 transition-colors duration-300" />
                      <span className="group-hover:text-neutral-200 transition-colors duration-300">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Terminal Hacker Mini-Game ─── */

const HACK_LEVELS = [
  {
    name: "FIREWALL",
    prompt: "Firewall detected. Bypass required.",
    hint: "Try: nmap, scan, bypass, exploit",
    validCommands: { nmap: "Scanning ports... Port 443 open.", scan: "Scanning ports... Port 443 open.", bypass: "Injecting payload... Firewall bypassed!", exploit: "Injecting payload... Firewall bypassed!" },
    winCommands: ["bypass", "exploit"],
  },
  {
    name: "ENCRYPTION",
    prompt: "AES-256 encrypted partition found.",
    hint: "Try: decrypt, crack, brute, hashcat",
    validCommands: { decrypt: "Attempting decryption... Need key.", crack: "Running hashcat... Key found: 0xDEAD", brute: "Running hashcat... Key found: 0xDEAD", hashcat: "Running hashcat... Key found: 0xDEAD" },
    winCommands: ["crack", "brute", "hashcat"],
  },
  {
    name: "DATABASE",
    prompt: "PostgreSQL instance exposed on :5432.",
    hint: "Try: sqlmap, inject, dump, exfiltrate",
    validCommands: { sqlmap: "SQLMap running... Vulnerability found!", inject: "SQL injection successful. Tables visible.", dump: "Dumping credentials... Access granted!", exfiltrate: "Dumping credentials... Access granted!" },
    winCommands: ["dump", "exfiltrate"],
  },
  {
    name: "ROOT ACCESS",
    prompt: "Privilege escalation required.",
    hint: "Try: sudo, escalate, privesc, rootkit",
    validCommands: { sudo: "Permission denied. Try harder.", escalate: "Kernel exploit found... Escalating...", privesc: "Kernel exploit found... Escalating...", rootkit: "Root shell obtained! System compromised." },
    winCommands: ["rootkit"],
  },
];

function TerminalHacker() {
  const [ref, visible] = useReveal();
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(0);
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState("");
  const [completed, setCompleted] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const addLine = (text, type = "output") => {
    setLines((prev) => [...prev, { text, type, id: Date.now() + Math.random() }]);
  };

  const typewriterAdd = (text, type = "success", delay = 0) => {
    setTimeout(() => {
      addLine(text, type);
    }, delay);
  };

  const startGame = () => {
    setStarted(true);
    setLevel(0);
    setCompleted(false);
    setLines([
      { text: "BANKOFTUC_SECURITY_v3.1 — Penetration Test Module", type: "header", id: 1 },
      { text: "==========================================", type: "dim", id: 2 },
      { text: "Target: 147.27.70.44 (Bank of TUC Server)", type: "info", id: 3 },
      { text: "Objective: Obtain root access", type: "info", id: 4 },
      { text: "==========================================", type: "dim", id: 5 },
      { text: "", type: "output", id: 6 },
      { text: `[LEVEL 1/${HACK_LEVELS.length}] ${HACK_LEVELS[0].name}`, type: "level", id: 7 },
      { text: HACK_LEVELS[0].prompt, type: "warning", id: 8 },
      { text: HACK_LEVELS[0].hint, type: "dim", id: 9 },
    ]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    addLine(`$ ${cmd}`, "command");

    if (trimmed === "help") {
      addLine("Commands: help, clear, hint, status, exit", "dim");
      addLine("Type attack commands to progress through security layers.", "dim");
      return;
    }
    if (trimmed === "clear") {
      setLines([]);
      return;
    }
    if (trimmed === "exit") {
      addLine("Connection terminated.", "error");
      setTimeout(() => { setStarted(false); setLines([]); }, 1000);
      return;
    }
    if (trimmed === "hint") {
      addLine(HACK_LEVELS[level].hint, "dim");
      return;
    }
    if (trimmed === "status") {
      addLine(`Progress: Level ${level + 1}/${HACK_LEVELS.length} — ${HACK_LEVELS[level].name}`, "info");
      return;
    }

    const currentLevel = HACK_LEVELS[level];
    const response = currentLevel.validCommands[trimmed];

    if (response) {
      addLine(response, "success");

      if (currentLevel.winCommands.includes(trimmed)) {
        const nextLevel = level + 1;

        if (nextLevel >= HACK_LEVELS.length) {
          typewriterAdd("", "output", 400);
          typewriterAdd("██████████████████████████████████████", "success", 600);
          typewriterAdd("  ACCESS GRANTED — ROOT SHELL ACTIVE", "success", 800);
          typewriterAdd("██████████████████████████████████████", "success", 1000);
          typewriterAdd("", "output", 1200);
          typewriterAdd("All security layers breached.", "info", 1400);
          typewriterAdd("Maybe I should hire you. Type 'exit' to disconnect.", "dim", 1800);
          setTimeout(() => setCompleted(true), 1500);
        } else {
          typewriterAdd(`✓ ${currentLevel.name} breached!`, "success", 300);
          typewriterAdd("", "output", 500);
          typewriterAdd(`[LEVEL ${nextLevel + 1}/${HACK_LEVELS.length}] ${HACK_LEVELS[nextLevel].name}`, "level", 700);
          typewriterAdd(HACK_LEVELS[nextLevel].prompt, "warning", 900);
          typewriterAdd(HACK_LEVELS[nextLevel].hint, "dim", 1100);
          setTimeout(() => setLevel(nextLevel), 700);
        }
      }
    } else {
      const responses = [
        "Command not recognized. Type 'help' for options.",
        "Access denied. Try a different approach.",
        "Unknown command. Use 'hint' for guidance.",
        "Syntax error. The system didn't understand that.",
      ];
      addLine(responses[Math.floor(Math.random() * responses.length)], "error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    }
  };

  const lineColor = (type) => {
    switch (type) {
      case "command": return "text-amber-400";
      case "success": return "text-green-400";
      case "error": return "text-red-400";
      case "warning": return "text-yellow-400";
      case "info": return "text-cyan-400";
      case "level": return "text-amber-300 font-bold";
      case "header": return "text-amber-400 font-bold";
      case "dim": return "text-neutral-600";
      default: return "text-neutral-400";
    }
  };

  return (
    <section id="terminal" className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-amber-400/70 mb-4">Interactive</p>
          <h2 className="text-3xl sm:text-4xl font-extralight text-neutral-200 mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>
            Hack the system<span className="text-amber-400">.</span>
          </h2>

          {/* Terminal window */}
          <div className="border border-neutral-800/60 rounded-lg overflow-hidden" style={{ cursor: "auto" }}>
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-neutral-900/80 border-b border-neutral-800/50">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 font-mono text-xs text-neutral-600">
                {completed ? "root@bankoftuc:~#" : "guest@bankoftuc:~/pentest"}
              </span>
            </div>

            {/* Terminal body */}
            <div
              ref={terminalRef}
              className="bg-neutral-950/90 p-5 font-mono text-sm leading-relaxed overflow-y-auto"
              style={{ minHeight: "320px", maxHeight: "420px", cursor: "text" }}
              onClick={() => inputRef.current?.focus()}
            >
              {!started ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <pre className="text-amber-400/60 text-xs text-center leading-tight">{`
  ╔══════════════════════════════╗
  ║   PENETRATION TEST MODULE   ║
  ║      Bank of TUC v3.1       ║
  ╚══════════════════════════════╝`}</pre>
                  <p className="text-neutral-500 text-xs">Breach 4 security layers to gain root access</p>
                  <button
                    onClick={startGame}
                    className="mt-2 border border-amber-400/40 text-amber-400 font-mono text-xs tracking-widest uppercase px-6 py-2 hover:bg-amber-400/10 transition-all duration-300"
                    style={{ cursor: "pointer" }}
                  >
                    Initialize Connection
                  </button>
                </div>
              ) : (
                <>
                  {lines.map((line) => (
                    <div key={line.id} className={`${lineColor(line.type)} ${line.text === "" ? "h-4" : ""}`}>
                      {line.text}
                    </div>
                  ))}
                  {/* Input line */}
                  <div className="flex items-center mt-1">
                    <span className="text-amber-400 mr-2">$</span>
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent text-neutral-200 outline-none font-mono text-sm caret-transparent"
                        style={{ cursor: "text" }}
                        autoFocus
                        spellCheck={false}
                        autoComplete="off"
                      />
                      {/* Fake block cursor */}
                      <span
                        className="absolute top-0 pointer-events-none text-sm font-mono"
                        style={{ left: `${input.length * 8.4}px` }}
                      >
                        <span className={`inline-block w-2 h-4 ${cursorVisible ? "bg-amber-400" : "bg-transparent"} transition-colors duration-100`} />
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-800/40 py-16 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="font-mono text-xs text-neutral-600 tracking-wider">
          &copy; {new Date().getFullYear()} Dimitris Belias
        </p>
        <div className="flex gap-6">
          <a href={SOCIAL.github} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-amber-400 transition-colors duration-300" aria-label="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
          <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-amber-400 transition-colors duration-300" aria-label="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href={SOCIAL.email} className="text-neutral-500 hover:text-amber-400 transition-colors duration-300" aria-label="Email">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M22 4l-10 8L2 4"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main App ─── */

export default function Portfolio() {
  const [active, setActive] = useState("");

  useEffect(() => {
    // Load Syne font
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Track active section
    const sectionEls = SECTIONS.map((s) => document.getElementById(s)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { threshold: 0.3 }
    );
    sectionEls.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="text-neutral-300 min-h-screen selection:bg-amber-400/20 selection:text-amber-200 cursor-none" style={{ background: "transparent" }}>
      <StarField />
      <CometCursor />
      <div className="relative z-10 cursor-none">
      <Navbar active={active} />
      <Hero />
      <About />
      <Projects />
      <Skills />
      <TerminalHacker />
      <Footer />
      </div>
    </div>
  );
}
