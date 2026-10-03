"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { submitContact } from "@/lib/contact-api";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Copy,
  Check,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  MessageSquare,
  Clock,
  AlertCircle,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ResolvedSectionMeta, SiteConfig, SocialLinks } from "@/lib/content";

interface ContactProps {
  site: SiteConfig;
  links: SocialLinks;
  heading: ResolvedSectionMeta;
}

export default function Contact({ site, links, heading }: ContactProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    // Honeypot. Off-screen and never filled in by a real visitor.
    website: "",
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(links.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setErrorMessage(null);

    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        // The API treats an empty subject as absent, so only send it when filled.
        subject: formData.subject || undefined,
        message: formData.message,
        website: formData.website,
      });
      setFormStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "", website: "" });
      setTimeout(() => setFormStatus("idle"), 5000);
    } catch (error) {
      setFormStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Background glow */}
      <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary/4 blur-3xl pointer-events-none" />

      <SectionHeading
        index={heading.index}
        label={heading.label}
        title={heading.title}
        subtitle={heading.subtitle ?? ""}
      />

      <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Info & FAQs (col-span-5) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 space-y-6"
        >
          {/* Availability Card */}
          <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-500">
                {site.status ?? "Available For Hire"}
              </span>
            </div>
            {site.statusSubtext && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {site.statusSubtext}
              </p>
            )}
          </div>

          {/* Contact Direct Channels */}
          <div className="space-y-3">
            {/* Email Card */}
            <Card className="border-border/70 bg-card hover:border-primary/50 transition-colors p-4">
              <CardContent className="p-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </div>
                    <a
                      href={`mailto:${links.email}`}
                      className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block"
                    >
                      {links.email}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-2 rounded-lg border border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer"
                  title="Copy email to clipboard"
                  aria-label="Copy email"
                >
                  {copiedEmail ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="border-border/70 bg-card hover:border-primary/50 transition-colors p-4">
              <CardContent className="p-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Phone / WhatsApp
                  </div>
                  <a
                    href={`tel:${links.phone}`}
                    className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors font-mono"
                  >
                    {links.phone}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="border-border/70 bg-card p-4">
              <CardContent className="p-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Location
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground">
                    {site.location ?? "Cairo, Egypt"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Links Row */}
          <div className="pt-2 flex items-center gap-2">
            {[
              { icon: Github, href: links.github, label: "GitHub" },
              { icon: Linkedin, href: links.linkedin, label: "LinkedIn" },
              { icon: Twitter, href: links.twitter, label: "Twitter" },
              { icon: Facebook, href: links.facebook, label: "Facebook" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-10 h-10 rounded-xl border border-border/70 bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-card/80 transition-all duration-200"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Contact Form (col-span-7) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7"
        >
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/70 shadow-sm relative">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-foreground">
                  Send a Message
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Direct message dispatch • No spam guarantee
                </p>
              </div>
            </div>

            {formStatus === "success" ? (
              <div className="p-8 rounded-xl bg-primary/10 border border-primary/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <h4 className="text-lg font-bold text-foreground">Message Dispatched!</h4>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  Thank you for reaching out, {site.firstName ?? "I"} will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/*
                  Honeypot. Positioned off-screen rather than hidden with
                  `display: none` or `type="hidden"`, because bots skip those
                  but still fill in a text input they cannot see. `aria-hidden`
                  and `tabIndex={-1}` keep it out of the accessibility tree and
                  the tab order, so a real visitor never encounters it.
                */}
                <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="contact-website">Leave this field empty</label>
                  <input
                    id="contact-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Your Name <span className="text-primary">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background border-border/70 focus-visible:border-primary text-sm h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Your Email <span className="text-primary">*</span>
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-background border-border/70 focus-visible:border-primary text-sm h-11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Subject / Project Scope
                  </label>
                  <Input
                    placeholder="e.g. Flutter Mobile Application / Engineering Collaboration"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="bg-background border-border/70 focus-visible:border-primary text-sm h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Message <span className="text-primary">*</span>
                  </label>
                  <Textarea
                    required
                    rows={5}
                    placeholder="Tell me about your project, timeline, goals, or questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-background border-border/70 focus-visible:border-primary text-sm resize-none"
                  />
                </div>

                {formStatus === "error" && errorMessage && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs sm:text-sm text-destructive"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                    <Clock size={12} className="text-primary" />
                    <span>Average response time: &lt; 24 hours</span>
                  </div>

                  <Button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className="w-full sm:w-auto rounded-full px-8 py-2.5 font-mono text-xs tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 cursor-pointer h-10"
                  >
                    {formStatus === "submitting" ? (
                      <span>Sending...</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Message <Send size={13} />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
