"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/shared";
import { siteConfig } from "@/lib/data";
import {
  MapPin,
  Phone,
  Mail,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Send,
  Download,
  ChevronDown,
} from "lucide-react";

/* ----------------------------------------------------------------------- */
/* Real data derived for this section                                      */
/* ----------------------------------------------------------------------- */

const contactOptions = [
  { icon: MapPin, label: "Location", value: "Giza, Egypt", href: null as string | null },
  {
    icon: Phone,
    label: "Phone",
    value: siteConfig.links.phone,
    href: `tel:${siteConfig.links.phone}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: siteConfig.links.email,
    href: `mailto:${siteConfig.links.email}`,
  },
];

const socialHub = [
  { icon: Github, label: "GitHub", href: siteConfig.links.github },
  { icon: Linkedin, label: "LinkedIn", href: siteConfig.links.linkedin },
  { icon: Twitter, label: "Twitter / X", href: siteConfig.links.twitter },
  { icon: Facebook, label: "Facebook", href: siteConfig.links.facebook },
];

const trustBadges = [
  "Fast Response",
  "Clean Communication",
  "Transparent Workflow",
  "On-Time Delivery",
];

const collaborationTypes = ["Freelance", "Full-time", "Internship", "Open Source"];

/** FAQ — honest, general answers grounded in real, stated facts (location,
 * response time, stack) rather than fabricated specifics. */
const faqs = [
  {
    q: "Can you work remotely?",
    a: "Yes — based in Giza, Egypt, and set up to collaborate with remote and distributed teams.",
  },
  {
    q: "Are you available right now?",
    a: "Open to freelance projects and full-time roles. Availability is confirmed after an initial conversation.",
  },
  {
    q: "What's your usual response time?",
    a: "Typically within 24 hours for emails and messages.",
  },
  {
    q: "Do you take on open-source or internship work?",
    a: "Yes — open to open-source collaboration and internship opportunities alongside freelance/full-time work.",
  },
];

/** Builds a real vCard from the actual siteConfig data — no QR library is
 * installed in this project, so no new dependency was added; this uses a
 * plain Blob download instead of an image code. */
function downloadVCard() {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${siteConfig.name}`,
    "TITLE:Full-Stack Developer & Mobile Engineer",
    `EMAIL:${siteConfig.links.email}`,
    `TEL:${siteConfig.links.phone}`,
    `URL:${siteConfig.url}`,
    "ADR:;;Giza;;;Egypt",
    "END:VCARD",
  ].join("\n");

  const blob = new Blob([vcard], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ahmed-elgabbas.vcf";
  a.click();
  URL.revokeObjectURL(url);
}

/* ----------------------------------------------------------------------- */
/* Small building blocks                                                   */
/* ----------------------------------------------------------------------- */

function RowTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] font-semibold text-(--color-muted-foreground) uppercase tracking-[0.12em] mb-4">
      {children}
    </div>
  );
}

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <section id="contact" className="relative section-padding">
      <div className="section-container">
        {/* Header */}
        <SectionHeading
          index="06"
          label="Let's Connect"
          title="Have a project in mind? Let's talk."
        />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-(--color-muted) text-base leading-relaxed max-w-2xl mb-16"
        >
          Whether you have a project idea, a freelance opportunity, or simply
          want to connect, I&apos;d love to hear from you — I respond within
          24 hours.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ══════════════ Left column ══════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Contact options */}
            <RowTitle>Contact Options</RowTitle>
            <div className="space-y-3 mb-8">
              {contactOptions.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-4 p-4 rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) hover:border-(--color-border-hover) transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-(--radius-md) bg-(--color-surface) border border-(--color-border) flex items-center justify-center shrink-0 group-hover:border-(--color-border-hover) transition-all">
                    <item.icon size={16} className="text-(--color-accent)" />
                  </div>
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-(--color-muted-foreground) mb-0.5">
                      {item.label}
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-(--color-muted) text-sm hover:text-white transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-(--color-muted) text-sm">{item.value}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust section */}
            <RowTitle>Why Work With Me</RowTitle>
            <div className="flex flex-wrap gap-2 mb-8">
              {trustBadges.map((b) => (
                <span
                  key={b}
                  className="px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-glass-fill) font-mono text-[10px] uppercase tracking-[0.08em] text-(--color-muted)"
                >
                  {b}
                </span>
              ))}
            </div>

            {/* Social hub */}
            <RowTitle>Social Hub</RowTitle>
            <div className="flex items-center gap-3 mb-8">
              {socialHub.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-(--radius-md) border border-(--color-border) bg-(--color-glass-fill) flex items-center justify-center text-(--color-muted-foreground) hover:text-(--color-accent) hover:border-(--color-border-hover) transition-all duration-200"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>

            {/* Availability status */}
            <div className="p-5 rounded-(--radius-lg) border border-(--color-accent) bg-[rgba(212,175,55,0.05)] mb-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-(--color-accent) animate-pulse" />
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-(--color-accent)">
                  Open to Work
                </span>
              </div>
              <p className="text-(--color-muted) text-sm leading-relaxed">
                Available for freelance and full-time roles. Response
                guaranteed within 24 hours. Current focus: Full-Stack &amp;
                Mobile Development.
              </p>
            </div>

            {/* Collaboration types */}
            <RowTitle>Collaboration Types</RowTitle>
            <div className="flex flex-wrap gap-2 mb-8">
              {collaborationTypes.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-glass-fill) font-mono text-[10px] uppercase tracking-[0.08em] text-(--color-muted)"
                >
                  {c}
                </span>
              ))}
            </div>

            {/* Quick actions */}
            <RowTitle>Quick Actions</RowTitle>
            <div className="flex flex-wrap gap-3">
              <a
                href="/assets/Ahmed-Mahmoud-Ahmed-Elgabbas-FlowCV-Resume-20241202.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-(--color-accent) text-(--color-accent) font-mono text-[10px] uppercase tracking-[0.1em] hover:bg-[rgba(212,175,55,0.08)] hover:text-(--color-accent-hover) hover:border-(--color-accent-hover) transition-all duration-200"
              >
                <Download size={13} />
                Download CV
              </a>
              <button
                type="button"
                onClick={downloadVCard}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-(--color-border) bg-(--color-glass-fill) text-(--color-muted) font-mono text-[10px] uppercase tracking-[0.1em] hover:border-(--color-border-hover) hover:text-white transition-all duration-200"
              >
                <Download size={13} />
                Save Contact
              </button>
            </div>
          </motion.div>

          {/* ══════════════ Contact form ══════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <RowTitle>Send a Message</RowTitle>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                {
                  id: "contact-name",
                  label: "Name",
                  placeholder: "Your Name",
                  type: "text",
                  field: "name" as const,
                  required: true,
                },
                {
                  id: "contact-email",
                  label: "Email",
                  placeholder: "your@email.com",
                  type: "email",
                  field: "email" as const,
                  required: true,
                },
                {
                  id: "contact-subject",
                  label: "Subject",
                  placeholder: "Subject (Optional)",
                  type: "text",
                  field: "subject" as const,
                  required: false,
                },
              ].map((input) => (
                <div key={input.id}>
                  <label
                    htmlFor={input.id}
                    className="block font-mono text-[9px] tracking-[0.2em] uppercase text-(--color-muted-foreground) mb-2"
                  >
                    {input.label}
                  </label>
                  <input
                    id={input.id}
                    type={input.type}
                    required={input.required}
                    placeholder={input.placeholder}
                    value={formState[input.field]}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, [input.field]: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-(--radius-md) bg-(--color-glass-fill) border border-(--color-border) text-white text-sm placeholder:text-(--color-muted-foreground) focus:outline-none focus:border-(--color-accent) focus:bg-(--color-glass-fill-strong) transition-all duration-300 font-sans"
                  />
                </div>
              ))}

              <div>
                <label
                  htmlFor="contact-message"
                  className="block font-mono text-[9px] tracking-[0.2em] uppercase text-(--color-muted-foreground) mb-2"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="Tell me about your project..."
                  value={formState.message}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, message: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-(--radius-md) bg-(--color-glass-fill) border border-(--color-border) text-white text-sm placeholder:text-(--color-muted-foreground) focus:outline-none focus:border-(--color-accent) focus:bg-(--color-glass-fill-strong) transition-all duration-300 font-sans resize-none"
                />
              </div>

              <button
                id="contact-submit"
                type="submit"
                disabled={submitted}
                className="group relative w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-(--color-accent) text-(--color-accent) font-mono text-[10px] tracking-[0.2em] uppercase overflow-hidden hover:bg-[rgba(212,175,55,0.08)] hover:text-(--color-accent-hover) hover:border-(--color-accent-hover) disabled:opacity-50 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Send size={12} />
                  {submitted ? "Message Sent!" : "Send Message"}
                </span>
              </button>

              <p className="text-center font-mono text-[9px] tracking-[0.15em] uppercase text-(--color-muted-foreground) mt-3">
                No spam, ever. Promise.
              </p>
            </form>

            {/* FAQ */}
            <div className="mt-12">
              <RowTitle>Frequently Asked</RowTitle>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div
                    key={faq.q}
                    className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      aria-expanded={openFaq === i}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                    >
                      <span className="text-sm text-white font-medium">
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-(--color-accent) shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-4 text-(--color-muted) text-sm leading-relaxed">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ══════════════ Final CTA ══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-8 md:p-10 text-center"
        >
          <div className="font-display text-xl md:text-2xl font-bold text-white mb-5">
            Have an Idea? Let&apos;s Turn It Into Reality.
          </div>

          <a
            href="#contact-name"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#contact-name")?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-(--color-accent) text-(--color-accent) font-mono text-[11px] tracking-[0.14em] uppercase hover:bg-[rgba(212,175,55,0.08)] hover:text-(--color-accent-hover) hover:border-(--color-accent-hover) transition-all duration-300"
          >
            <Send size={14} />
            Start a Conversation
          </a>
        </motion.div>
      </div>
    </section>
  );
}