import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import About from "@/components/sections/about";
import Skills from "@/components/sections/skills";
import Experience from "@/components/sections/experience";
import Projects from "@/components/sections/projects";
import Certificates from "@/components/sections/certificates";
import Contact from "@/components/sections/contact";
import Footer from "@/components/sections/footer";
import {
  loadAbout,
loadCertificateCategories,
loadCertificates,
loadCertificateStats,
loadIssuingOrganizations,
  loadExperience,
  loadLinks,
  loadNav,
  loadProjectCategories,
  loadProjects,
  loadSectionMeta,
  loadSite,
  loadSkills,
  loadStats,
  loadTickerSkills,
  loadPhilosophyQuote,
} from "@/lib/content";

/**
 * Stage 3 cutover (BACKEND_PLAN.md §6).
 *
 * Content is fetched here, on the server, once per request rather than per
 * section, and passed down as props. Two reasons: the backend goes down far
 * less often than the browser reloads, and one failed fetch fails the page once
 * instead of six times. Every loader falls back to src/data/portfolio.ts, so a
 * backend outage or an unseeded database still renders the full site.
 *
 * Every section is fed from here, including Projects and Certificates: their
 * Stage 1 work covered the backend module and the admin UI, but the public
 * components were still importing src/data/portfolio.ts directly, so the
 * cutover below is what actually completes it for them.
 */
/**
 * Content is read per request (BACKEND_PLAN.md §6), so this route can never be
 * prerendered at build time. Declaring it explicitly is clearer than letting
 * Next.js infer it from the `no-store` fetches.
 */
export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    site,
    links,
    nav,
    stats,
    about,
    categories,
    tickerSkills,
    philosophyQuote,
    experience,
    headings,
    projectItems,
    projectCategories,
    certificateItems,
    certificateCategories,
    certificateStats,
    issuingOrganizations,
  ] = await Promise.all([
    loadSite(),
    loadLinks(),
    loadNav(),
    loadStats(),
    loadAbout(),
    loadSkills(),
    loadTickerSkills(),
    loadPhilosophyQuote(),
    loadExperience(),
    loadSectionMeta(),
    loadProjects(),
    loadProjectCategories(),
    loadCertificates(),
    loadCertificateCategories(),
    loadCertificateStats(),
    loadIssuingOrganizations(),
  ]);

  return (
    <>
      <Header navItems={nav} links={links} siteName={site.name} />
      <main className="min-h-screen">
        <Hero site={site} links={links} stats={stats} />
        <About about={about} stats={stats} site={site} heading={headings.about} />
        <Skills
          categories={categories}
          tickerSkills={tickerSkills}
          philosophyQuote={philosophyQuote}
          heading={headings.skills}
        />
        <Experience
          experiences={experience.experiences}
          education={experience.education}
          futureGoals={experience.futureGoals}
          heading={headings.experience}
        />
        <Projects
          projects={projectItems}
          categories={projectCategories}
          links={links}
          heading={headings.projects}
        />
        <Certificates
          certificates={certificateItems}
          categories={certificateCategories}
          stats={certificateStats}
          issuingOrganizations={issuingOrganizations}
          heading={headings.certificates}
        />
        <Contact site={site} links={links} heading={headings.contact} />
      </main>
      <Footer site={site} links={links} navItems={nav} />
    </>
  );
}