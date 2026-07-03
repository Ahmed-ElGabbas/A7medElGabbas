"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/shared";
import { siteConfig } from "@/lib/data";
import { MapPin, Phone, Mail, Github, Send } from "lucide-react";

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

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
          label="Contact"
          title="Have a project in mind? Let's talk."
        />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-neutral-400 text-base leading-relaxed max-w-2xl mb-16"
        >
          I&apos;m currently available for freelance projects and full-time
          roles. If you have something interesting in mind or just want to say
          hello, reach out — I respond within 24 hours.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {[
              {
                icon: MapPin,
                label: "Location",
                value: "Giza, Egypt",
                href: null,
              },
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
              {
                icon: Github,
                label: "GitHub",
                value: "github.com/Elagbbas",
                href: siteConfig.links.github,
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:border-white/[0.12] transition-all">
                  <item.icon size={16} className="text-neutral-500" />
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-neutral-600 mb-0.5">
                    {item.label}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-neutral-300 text-sm hover:text-white transition-colors"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-neutral-300 text-sm">{item.value}</span>
                  )}
                </div>
              </motion.div>
            ))}

            {/* CTA cards */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8 p-5 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-emerald-400/80">
                  Open to Work
                </span>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Available for freelance and full-time roles. Response guaranteed
                within 24 hours.
              </p>
            </motion.div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
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
                    className="block font-mono text-[9px] tracking-[0.2em] uppercase text-neutral-600 mb-2"
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
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.04] transition-all duration-300 font-sans"
                  />
                </div>
              ))}

              <div>
                <label
                  htmlFor="contact-message"
                  className="block font-mono text-[9px] tracking-[0.2em] uppercase text-neutral-600 mb-2"
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
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.04] transition-all duration-300 font-sans resize-none"
                />
              </div>

              <button
                id="contact-submit"
                type="submit"
                disabled={submitted}
                className="group relative w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-black font-mono text-[10px] tracking-[0.2em] uppercase overflow-hidden hover:bg-neutral-200 disabled:opacity-50 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Send size={12} />
                  {submitted ? "Message Sent!" : "Send Message"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              <p className="text-center font-mono text-[9px] tracking-[0.15em] uppercase text-neutral-700 mt-3">
                No spam, ever. Promise.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
