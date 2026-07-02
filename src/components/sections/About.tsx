"use client";

import { motion } from "framer-motion";
import { SectionHeading, ParallaxText } from "@/components/ui/shared";
import { ArrowUpRight } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="relative section-padding overflow-hidden">
      {/* Background parallax text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <ParallaxText>AHMED MAHMOUD</ParallaxText>
      </div>

      <div className="section-container relative z-10">
        <SectionHeading
          index="01"
          label="Identity"
          title="Full-Stack Developer & Mobile Engineer"
          subtitle="Bridging low-level architecture & high-level experiences. Based in Giza, Egypt. Building production-grade systems since 2023."
        />
        {/* Philosophy — left text + right floating editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ════════════════════════════════════════════
              LEFT SIDE — PIXEL-PERFECT, UNCHANGED
              ════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-neutral-400 text-lg md:text-xl leading-relaxed mb-4">
              Hi, I'm Ahmed Mahmoud Ahmed Elgabbas, a Computer Science and Artificial Intelligence student at Helwan National University specializing in Robotics Software Engineering. I am a passionate Software and Mobile Application Developer with a strong foundation in programming, problem-solving, and software architecture.
            </p>
            <p className="text-neutral-400 text-lg md:text-xl leading-relaxed mb-4">
              Beyond technical expertise, I Member of HR Committee at HNU-FCSIT ICPC Community and Head of Sports Committee at HNU-FCSIT Student Union. These leadership roles have strengthened my abilities in team management, event organization, and fostering collaborative environments. I am passionate about continuous learning, problem-solving, and delivering impactful solutions.
            </p>
            <p className="text-neutral-400 text-lg md:text-xl leading-relaxed mb-4">
              My technical interests include artificial intelligence, machine learning, software engineering, mobile development, and robotics, and I am committed to continuous learning and skill development to deliver high-quality, innovative, and impactful software solutions.
            </p>
          </motion.div>

          {/* ════════════════════════════════════════════
              RIGHT SIDE — PREMIUM FLOATING CODE EDITOR
              Static 3D · No hover animation/tilt on editor
              ════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center lg:items-end gap-5 w-full"
          >
            {/* Editor Container with Perspective */}
            <div
              className="relative w-full max-w-[500px]"
              style={{ perspective: "2000px" }}
            >
              {/* ── Premium Cinematic Emerald Ambient Underglow ── */}
              {/* Outer soft glow (#B8FFD3) */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: "5%",
                  right: "5%",
                  bottom: "-60px",
                  height: "160px",
                  borderRadius: "999px",
                  background: "radial-gradient(ellipse at center, rgba(184,255,211,0.06) 0%, transparent 80%)",
                  filter: "blur(60px)",
                }}
              />
              {/* Main glow (#8BFFB5) */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: "10%",
                  right: "10%",
                  bottom: "-40px",
                  height: "120px",
                  borderRadius: "999px",
                  background: "radial-gradient(ellipse at center, rgba(139,255,181,0.16) 0%, rgba(139,255,181,0.05) 50%, transparent 80%)",
                  filter: "blur(40px)",
                }}
              />
              {/* Core glow (#7DFF9E) */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: "20%",
                  right: "20%",
                  bottom: "-20px",
                  height: "60px",
                  borderRadius: "999px",
                  background: "radial-gradient(ellipse at center, rgba(125,255,158,0.22) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />

              {/* ── 3D Stack layers for physical thickness/depth in Z-space ── */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  transform: "perspective(2000px) rotateY(-12deg) rotateX(3deg) translateZ(-1px)",
                  background: "#0d0d0d",
                  borderLeft: "1px solid rgba(255,255,255,0.04)",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                }}
              />
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  transform: "perspective(2000px) rotateY(-12deg) rotateX(3deg) translateZ(-2px)",
                  background: "#090909",
                }}
              />
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  transform: "perspective(2000px) rotateY(-12deg) rotateX(3deg) translateZ(-3px)",
                  background: "#060606",
                  boxShadow: "6px 6px 16px rgba(0,0,0,0.85)",
                }}
              />

              {/* Real 3D Side Thickness Face (Right Side) */}
              <div
                className="absolute right-0 top-0 bottom-0 w-[4px] origin-right pointer-events-none rounded-r-xl"
                style={{
                  transform: "rotateY(90deg)",
                  background: "linear-gradient(to bottom, #1c1c1c, #0f0f0f)",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              />

              {/* Real 3D Bottom Thickness Face */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[4px] origin-bottom pointer-events-none rounded-b-xl"
                style={{
                  transform: "rotateX(-90deg)",
                  background: "#0b0b0b",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              />

              {/* ── Front Face of the 3D Editor Panel ── */}
              <div
                className="relative rounded-xl overflow-hidden"
                style={{
                  transform: "perspective(2000px) rotateY(-12deg) rotateX(3deg) translateZ(0)",
                  transformStyle: "preserve-3d",
                  background: "linear-gradient(155deg, #151515 0%, #0d0d0d 50%, #070707 100%)",
                  borderTop: "1px solid rgba(255,255,255,0.12)",
                  borderLeft: "1px solid rgba(255,255,255,0.12)",
                  borderRight: "1px solid rgba(255,255,255,0.04)",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.05),
                    0 2px 4px rgba(0,0,0,0.4),
                    0 8px 16px rgba(0,0,0,0.45),
                    0 20px 40px rgba(0,0,0,0.5),
                    0 40px 80px rgba(0,0,0,0.3)
                  `,
                }}
              >
                {/* ── Glass reflection overlay ── */}
                <div
                  className="absolute inset-0 pointer-events-none z-20"
                  style={{
                    background: "linear-gradient(105deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 18%, transparent 40%, transparent 80%, rgba(255,255,255,0.01) 100%)",
                  }}
                />

                {/* ── macOS Title Bar (exact traffic light colors and title bar layout) ── */}
                <div
                  className="relative flex items-center justify-between px-4 py-3"
                  style={{
                    background: "linear-gradient(to bottom, #1d1d1d, #141414)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                  }}
                >
                  <div className="flex items-center gap-[8px]">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F56]" style={{ boxShadow: "0 0 1px rgba(0,0,0,0.5)" }} />
                    <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" style={{ boxShadow: "0 0 1px rgba(0,0,0,0.5)" }} />
                    <span className="w-3 h-3 rounded-full bg-[#27C93F]" style={{ boxShadow: "0 0 1px rgba(0,0,0,0.5)" }} />
                  </div>
                  <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.05em] text-neutral-400">
                    developer.js
                  </span>
                  <span className="font-mono text-[10px] text-neutral-600 tracking-wider">
                    UTF-8
                  </span>
                </div>

                {/* ── Code Panel (sharp syntax highlighting, proper formatting) ── */}
                <div className="px-5 py-5 font-mono text-[11.5px] leading-[1.8] select-none text-neutral-200">
                  <CL n={1}>
                    <Kw>const</Kw> <Id>profile</Id> <Op>=</Op> <Br>{"{"}</Br>
                  </CL>
                  <CL n={2}>
                    <Ind /><Prop>name</Prop><Op>:</Op> <Str>&apos;Ahmed ElGabbas&apos;</Str><Op>,</Op>
                  </CL>
                  <CL n={3}>
                    <Ind /><Prop>title</Prop><Op>:</Op> <Str>&apos;Full-Stack Developer | Mobile Engineer&apos;</Str><Op>,</Op>
                  </CL>
                  <CL n={4}>
                    <Ind /><Prop>skills</Prop><Op>:</Op> <Br>[</Br>
                  </CL>
                  <CL n={5}>
                    <Ind /><Ind /><Str>&apos;React&apos;</Str><Op>,</Op> <Str>&apos;Next.js&apos;</Str><Op>,</Op> <Str>&apos;Flutter&apos;</Str><Op>,</Op>
                  </CL>
                  <CL n={6}>
                    <Ind /><Ind /><Str>&apos;ASP.NET&apos;</Str><Op>,</Op> <Str>&apos;Django&apos;</Str><Op>,</Op> <Str>&apos;TypeScript&apos;</Str><Op>,</Op>
                  </CL>
                  <CL n={7}>
                    <Ind /><Ind /><Str>&apos;Docker&apos;</Str><Op>,</Op> <Str>&apos;Node.js&apos;</Str><Op>,</Op> <Str>&apos;MongoDB&apos;</Str>
                  </CL>
                  <CL n={8}>
                    <Ind /><Br>]</Br><Op>,</Op>
                  </CL>
                  <CL n={9}>
                    <Ind /><Prop>hardWorker</Prop><Op>:</Op> <Bool>true</Bool><Op>,</Op>
                  </CL>
                  <CL n={10}>
                    <Ind /><Prop>quickLearner</Prop><Op>:</Op> <Bool>true</Bool><Op>,</Op>
                  </CL>
                  <CL n={11}>
                    <Ind /><Prop>problemSolver</Prop><Op>:</Op> <Bool>true</Bool><Op>,</Op>
                  </CL>
                  <CL n={12}>
                    <Ind /><Prop>yearsOfExperience</Prop><Op>:</Op> <Num>2</Num><Op>,</Op>
                  </CL>
                  <CL n={13}>
                    <Ind /><Prop>hireable</Prop><Op>:</Op> <Kw>function</Kw><Op>()</Op> <Br>{"{"}</Br>
                  </CL>
                  <CL n={14}>
                    <Ind /><Ind /><Kw>return</Kw> <Op>(</Op>
                  </CL>
                  <CL n={15}>
                    <Ind /><Ind /><Ind /><Kw>this</Kw><Op>.</Op><Prop>hardWorker</Prop> <Op>&amp;&amp;</Op>
                  </CL>
                  <CL n={16}>
                    <Ind /><Ind /><Ind /><Kw>this</Kw><Op>.</Op><Prop>problemSolver</Prop> <Op>&amp;&amp;</Op>
                  </CL>
                  <CL n={17}>
                    <Ind /><Ind /><Ind /><Kw>this</Kw><Op>.</Op><Prop>skills</Prop><Op>.</Op><Fn>length</Fn> <Op>&gt;=</Op> <Num>5</Num> <Op>&amp;&amp;</Op>
                  </CL>
                  <CL n={18}>
                    <Ind /><Ind /><Ind /><Kw>this</Kw><Op>.</Op><Prop>yearsOfExperience</Prop> <Op>&gt;=</Op> <Num>2</Num>
                  </CL>
                  <CL n={19}>
                    <Ind /><Ind /><Op>);</Op>
                  </CL>
                  <CL n={20}>
                    <Ind /><Br>{"}"}</Br>
                  </CL>
                  <CL n={21}>
                    <Br>{"}"}</Br><Op>;</Op>
                  </CL>
                </div>

                {/* ── Status Bar ── */}
                <div
                  className="flex items-center justify-between px-5 py-2.5"
                  style={{
                    background: "linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#27C93F]" style={{ boxShadow: "0 0 4px rgba(39,201,63,0.5)" }} />
                    <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-neutral-500">
                      READY
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[8px] tracking-[0.1em] text-neutral-600">
                      Ln 16, Col 3
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.1em] text-neutral-600">
                      UTF-8
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.1em] text-neutral-600">
                      JavaScript
                    </span>
                  </div>
                </div>
              </div>

              {/* Top edge light reflection overlay inside perspective */}
              <div
                className="absolute top-0 left-6 right-6 h-px pointer-events-none z-30"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                  transform: "perspective(2000px) rotateY(-12deg) rotateX(3deg)",
                }}
              />
            </div>

            {/* ── CV Button ── */}
            <motion.a
              href="/assets/Ahmed-Mahmoud-Ahmed-Elgabbas-FlowCV-Resume-20241202.pdf"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="group/cv relative w-full max-w-[500px] flex items-center justify-center gap-3 px-6 py-4 rounded-xl overflow-hidden font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-[350ms] ease-out"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.6)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "rgba(139,255,181,0.2)";
                el.style.background = "rgba(255,255,255,0.035)";
                el.style.color = "rgba(255,255,255,0.95)";
                el.style.boxShadow = "0 0 24px rgba(139,255,181,0.06), 0 4px 16px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "rgba(255,255,255,0.06)";
                el.style.background = "rgba(255,255,255,0.02)";
                el.style.color = "rgba(255,255,255,0.6)";
                el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
              }}
            >
              <span className="relative z-10">view cv</span>
              <ArrowUpRight
                size={14}
                className="relative z-10 transition-transform duration-300 group-hover/cv:translate-x-[4px] group-hover/cv:-translate-y-[2px]"
              />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   Syntax highlight components — VS Code Dark+
   ────────────────────────────────────────────── */

function CL({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start">
      <span className="w-8 shrink-0 text-right pr-4 text-neutral-600 select-none text-[11px] leading-[1.75]">
        {n}
      </span>
      <span className="leading-[1.75]">{children}</span>
    </div>
  );
}

function Ind() {
  return <span className="inline-block w-[1.4em]" />;
}

function Kw({ children }: { children: React.ReactNode }) {
  return <span className="text-[#c586c0]">{children} </span>;
}

function Id({ children }: { children: React.ReactNode }) {
  return <span className="text-[#9cdcfe] font-medium">{children} </span>;
}

function Prop({ children }: { children: React.ReactNode }) {
  return <span className="text-[#9cdcfe]">{children}</span>;
}

/** String literal color matched exactly to VS Code Dark+ standard */
function Str({ children }: { children: React.ReactNode }) {
  return <span className="text-[#ce9178]">{children}</span>;
}

function Num({ children }: { children: React.ReactNode }) {
  return <span className="text-[#b5cea8]">{children}</span>;
}

function Bool({ children }: { children: React.ReactNode }) {
  return <span className="text-[#569cd6]">{children}</span>;
}

function Op({ children }: { children: React.ReactNode }) {
  return <span className="text-[#d4d4d4]">{children} </span>;
}

function Br({ children }: { children: React.ReactNode }) {
  return <span className="text-[#ffd700]">{children}</span>;
}

function Fn({ children }: { children: React.ReactNode }) {
  return <span className="text-[#dcdcaa]">{children}</span>;
}
