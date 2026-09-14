/**
 * ============================================================================
 * AHMED ELGABBAS — PORTFOLIO CENTRAL DATA SOURCE
 * ============================================================================
 * 
 * Edit this single file to update any content across the entire portfolio website:
 * - Personal info, roles, and status
 * - Contact information and social media links
 * - Navigation links
 * - About me bio and quick facts
 * - Skills and technology categories
 * - Work experience and timeline
 * - Academic education and courses
 * - Portfolio projects
 * - Recognitions, achievements, and stats
 * 
 * Any changes made here will automatically reflect across all sections!
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/* 1. PERSONAL INFORMATION & SITE METADATA                                    */
/* -------------------------------------------------------------------------- */
export const personalInfo = {
  name: "Ahmed ElGabbas",
  firstName: "Ahmed",
  lastName: "ElGabbas",
  title: "Ahmed ElGabbas — Full-Stack Developer & Mobile Engineer",
  metaDescription:
    "Ahmed ElGabbas — Full-Stack Software Engineer & Mobile Application Developer. Building scalable systems with React, Next.js, Flutter, and .NET. Available for hire.",
  url: "https://ahmedelgabbas.dev",
  photo: "/assets/main.png.jpeg",
  resumePath: "/assets/Ahmed-Mahmoud-Ahmed-Elgabbas-FlowCV-Resume-20241202.pdf",
  location: "Cairo, Egypt",
  status: "Available for Hire",
  statusSubtext: "Open to Collaborations",
  headline:
    "Engineering high-performance mobile applications, robust full-stack web platforms, and intelligent robotics software with clean architecture.",

  // Rotating roles displayed in the hero section
  roles: [
    "Full-Stack Developer",
    "Mobile Engineer",
    "Backend Architect",
    "Flutter Developer",
    "Problem Solver",
  ],
};

/* -------------------------------------------------------------------------- */
/* 2. CONTACT CHANNELS & SOCIAL LINKS                                         */
/* -------------------------------------------------------------------------- */
export const socialLinks = {
  email: "ahmedelgabbas769@gmail.com",
  phone: "+201117024500",
  github: "https://github.com/Elagbbas",
  linkedin: "https://www.linkedin.com/in/ahmed-elgabbas-33a186344",
  twitter: "https://x.com/A7med_ElGabbas",
  facebook: "https://www.facebook.com/share/17dLWSBhAa/",
};

/* -------------------------------------------------------------------------- */
/* 3. NAVIGATION ITEMS                                                        */
/* -------------------------------------------------------------------------- */
export const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Certificates", href: "#certificates" },
  { label: "Contact", href: "#contact" },
];

/* -------------------------------------------------------------------------- */
/* 4. OVERALL STATS                                                           */
/* -------------------------------------------------------------------------- */
export const stats = [
  { value: "2+", label: "Years Experience" },
  { value: "15+", label: "Projects Completed" },
  { value: "8+", label: "Technologies" },
  { value: "500+", label: "Problems Solved" },
];

/* -------------------------------------------------------------------------- */
/* 5. ABOUT ME SECTION                                                        */
/* -------------------------------------------------------------------------- */
export const aboutData = {
  sectionSubtitle: "Bridging software craftsmanship, modern mobile architecture, and intelligent robotics.",
  narrativeTitle: "Passionate about turning complex concepts into elegant digital experiences.",
  paragraphs: [
    "I am a Computer Science & Artificial Intelligence student at Helwan National University, specializing in Robotics Software Engineering. My passion lies at the intersection of high-performance mobile applications, scalable backend systems, and autonomous robotics logic.",
    "Over the past 2+ years, I have engineered cross-platform mobile solutions using Flutter and Dart, crafted responsive full-stack web applications with Next.js and ASP.NET Core, and applied rigorous clean architecture and SOLID design principles across every project.",
    "Beyond writing code, I actively contribute to the tech community as a member of the HNU ICPC Community HR Committee, where I organize technical workshops, mentor fellow developers, and champion competitive programming.",
  ],
  highlights: [
    "Specialized in cross-platform mobile apps with Flutter & clean architecture",
    "Full-stack web development with Next.js, React, Node.js, and ASP.NET Core",
    "Robotics software engineering: computer vision, ROS, and autonomous logic",
    "Active competitive programmer with 500+ algorithmic problems solved",
  ],
  quickFacts: [
    {
      label: "Degree",
      value: "B.Sc. CS & AI (Robotics)",
      detail: "Helwan National University",
    },
    {
      label: "Location",
      value: "Cairo, Egypt",
      detail: "Open to Remote & Relocation",
    },
    {
      label: "Status",
      value: "Available for Hire",
      detail: "Internships & Full-time",
    },
    {
      label: "Core Stack",
      value: "Flutter, React, .NET",
      detail: "TypeScript & Dart Specialist",
    },
  ],
  academicFocus: {
    title: "Robotics Software Engineering Specialization",
    description:
      "Studying real-time systems, kinematics, path planning algorithms, and AI models tailored for smart automation and robotics.",
  },
};

/* -------------------------------------------------------------------------- */
/* 6. SKILLS & TECHNOLOGIES                                                   */
/* -------------------------------------------------------------------------- */
export const skillCategories = [
  {
    title: "Programming Languages",
    icon: "code",
    skills: ["C", "C++", "C#", "Java", "Python", "Go", "SQL", "LINQ"],
  },
  {
    title: "Frontend Development",
    icon: "layout",
    skills: [
      "React",
      "Next.js",
      "Angular",
      "TypeScript",
      "Tailwind CSS",
      "Bootstrap",
      "SASS",
      "Framer Motion",
      "Redux",
    ],
  },
  {
    title: "Mobile Development",
    icon: "smartphone",
    skills: ["Flutter", "Dart", "Firebase", "Android", "iOS"],
  },
  {
    title: "Backend Development",
    icon: "server",
    skills: ["Node.js", "Express.js", "ASP.NET Core", "Django", "REST APIs"],
  },
  {
    title: "Databases",
    icon: "database",
    skills: ["MySQL", "PostgreSQL", "MS SQL Server", "SQLite", "MongoDB"],
  },
  {
    title: "Tools & DevOps",
    icon: "wrench",
    skills: ["Git", "GitHub", "Docker", "Postman", "Linux", "VS Code"],
  },
];

export const skillSpotlights: Record<
  string,
  { summary: string; patterns: string[]; primaryProject: string }
> = {
  "Programming Languages": {
    summary:
      "Core languages mastered for competitive programming, algorithmic optimization, and system-level performance.",
    patterns: [
      "OOP & SOLID Principles",
      "Data Structures & Algorithms",
      "Memory Management",
      "Clean Code Standards",
    ],
    primaryProject: "ICPC Competitive Solutions & System Kernels",
  },
  "Frontend Development": {
    summary:
      "Modern web toolchains crafting ultra-responsive, accessible, and high-framerate interfaces with pixel perfection.",
    patterns: [
      "Next.js App Router & SSR",
      "State Management (Redux/Zustand)",
      "Framer Motion Micro-Interactions",
      "Tailwind Design Systems",
    ],
    primaryProject: "Modern Full-Stack Applications & Portfolios",
  },
  "Mobile Development": {
    summary:
      "Cross-platform mobile engineering delivering native-speed experiences for iOS and Android from a single robust codebase.",
    patterns: [
      "Clean Architecture & Domain Separation",
      "BLoC & Riverpod State Management",
      "Firebase Real-time Sync",
      "Offline-first Storage",
    ],
    primaryProject: "E-Commerce Mobile App & Healthcare Suite",
  },
  "Backend Development": {
    summary:
      "Resilient, maintainable microservices and REST APIs designed for high throughput, data integrity, and scalability.",
    patterns: [
      "RESTful API Contracts",
      "JWT & OAuth Security",
      "Middleware Architecture",
      "Clean Architecture / Repository Pattern",
    ],
    primaryProject: "Distributed Backend & API Gateways",
  },
  Databases: {
    summary:
      "Relational and NoSQL storage engines optimized for indexing, transactional integrity, and normalized schema design.",
    patterns: [
      "Schema Normalization & Indexing",
      "ACID Transactions",
      "Object-Relational Mapping (EF Core/Prisma)",
      "Query Optimization",
    ],
    primaryProject: "Multi-tenant E-Commerce Data Models",
  },
  "Tools & DevOps": {
    summary:
      "Modern developer tooling and workflows streamlining continuous integration, containerization, and agile execution.",
    patterns: [
      "Git Flow & Pull Request Reviews",
      "Dockerized Container Runtimes",
      "API Testing & Automation",
      "Linux CLI Environments",
    ],
    primaryProject: "Automated Build & Deployment Pipelines",
  },
};

export const philosophyQuote = {
  quote:
    "Software architecture is not merely about choosing frameworks; it is about managing complexity, enforcing separation of concerns, and crafting code that remains maintainable as scale evolves.",
  author: "Ahmed ElGabbas",
};

export const tickerSkills = [
  "React.js",
  "Next.js",
  "Flutter",
  "ASP.NET Core",
  "TypeScript",
  "Node.js",
  "Clean Architecture",
  "Full-Stack Developer",
  "Python",
  "Tailwind CSS",
  "Docker",
  "BLoC",
];

/* -------------------------------------------------------------------------- */
/* 7. EXPERIENCE & EDUCATION                                                  */
/* -------------------------------------------------------------------------- */
export const experiences = [
  {
    role: "Mobile Application Developer",
    company: "Flutter & Dart",
    period: "2024 — Present",
    description:
      "Building cross-platform mobile applications with Flutter, implementing clean architecture, state management with BLoC/Cubit, and integrating Firebase services for real-time features.",
    technologies: ["Flutter", "Dart", "Firebase", "REST APIs", "BLoC"],
  },
  {
    role: "Full-Stack Web Developer",
    company: "React & Next.js",
    period: "2024 — Present",
    description:
      "Developing modern web applications using React, Next.js, and TypeScript. Building RESTful APIs with Node.js and Express, implementing responsive designs with Tailwind CSS.",
    technologies: ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS"],
  },
  {
    role: "Backend Developer",
    company: "ASP.NET Core & Django",
    period: "2023 — Present",
    description:
      "Designing and implementing server-side solutions with ASP.NET Core and Django. Working with SQL and NoSQL databases, building scalable REST APIs and microservices.",
    technologies: ["ASP.NET Core", "Django", "PostgreSQL", "MongoDB", "Docker"],
  },
];

export const education = [
  {
    degree: "B.Sc. Computer Science & Artificial Intelligence",
    institution: "Helwan National University",
    period: "2024 — 2028",
    description:
      "Specializing in Robotics Software Engineering. Coursework includes Data Structures, Algorithms, OOP, Database Systems, Software Engineering, and AI fundamentals.",
    gpa: "Currently pursuing",
    courses: [
      "Robotics Software",
      "Algorithms & Data Structures",
      "Distributed Systems",
      "Computer Vision",
      "Object-Oriented Design",
      "Database Architectures",
    ],
  },
];

export const futureGoals = {
  title: "Autonomous Robotics & Distributed Mobile",
  description:
    "Targeting production-scale mobile applications powered by offline-first reactive state management, as well as AI-powered autonomous robotics software engines.",
  items: [
    "Deepening ROS2 & Real-Time Robotics Control",
    "Enterprise Flutter & Full-Stack System Design",
    "Advanced Algorithm Design for Scalable Systems",
  ],
};

/* -------------------------------------------------------------------------- */
/* 8. FEATURED PROJECTS                                                       */
/* -------------------------------------------------------------------------- */
export const projects = [
  {
    title: "E-Commerce Mobile App",
    description:
      "A full-featured cross-platform e-commerce application built with Flutter. Includes product browsing, cart management, secure checkout, and real-time order tracking with Firebase backend.",
    technologies: ["Flutter", "Dart", "Firebase", "REST API", "BLoC"],
    category: "Mobile",
    featured: true,
  },
  {
    title: "Task Management Platform",
    description:
      "A collaborative task management web application with real-time updates, team workspaces, and Kanban boards. Built with React and Node.js with WebSocket integration.",
    technologies: ["React", "Node.js", "MongoDB", "Socket.io", "Tailwind CSS"],
    category: "Full-Stack",
    featured: true,
  },
  {
    title: "Restaurant POS System",
    description:
      "A comprehensive point-of-sale system for restaurants built with ASP.NET Core. Features order management, inventory tracking, and analytics dashboard.",
    technologies: ["ASP.NET Core", "C#", "SQL Server", "Bootstrap"],
    category: "Backend",
    featured: true,
  },
  {
    title: "Portfolio Website",
    description:
      "A modern portfolio website built with Next.js and Framer Motion. Features smooth animations, responsive design, and optimized performance.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    category: "Frontend",
    featured: false,
  },
  {
    title: "Chat Application",
    description:
      "Real-time messaging app with Flutter featuring end-to-end encryption, group chats, media sharing, and push notifications via Firebase Cloud Messaging.",
    technologies: ["Flutter", "Firebase", "Dart", "Cloud Functions"],
    category: "Mobile",
    featured: false,
  },
  {
    title: "Blog API",
    description:
      "A RESTful blog API built with Django REST Framework featuring JWT authentication, CRUD operations, pagination, and comprehensive API documentation with Swagger.",
    technologies: ["Django", "Python", "PostgreSQL", "Docker"],
    category: "Backend",
    featured: false,
  },
];

/* -------------------------------------------------------------------------- */
/* 9. LICENSES & CERTIFICATIONS                                               */
/* -------------------------------------------------------------------------- */
export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  credentialUrl?: string;
  category: "Mobile & Flutter" | "Web & Frontend" | "Backend & APIs" | "Algorithms & AI";
  skills: string[];
  badgeText: string;
  description: string;
  featured?: boolean;
  previewImage?: string;
  file?: string;
}

export const certificates: Certificate[] = [
  {
    id: "icpc-ecpc-contest",
    title: "ECPC Collegiate Programming Contest Qualification",
    issuer: "ICPC Foundation & AASTMT",
    issueDate: "2024",
    credentialId: "ICPC-ECPC-2024-HNU",
    credentialUrl: "https://icpc.global",
    category: "Algorithms & AI",
    skills: ["Competitive Programming", "High-Performance C++", "Team Contest Strategy"],
    badgeText: "Official Contestant",
    description:
      "Official collegiate algorithmic contest qualification representing Helwan National University in competitive programming, combinatorics, and number theory.",
    featured: true,
    previewImage: "/assets/certificates/ecpc-preview.jpg.jpeg",
    file: "/assets/certificates/2026-ECPC Q 4-Ahmed ELGabbas-PLACE (2)-1.pdf",
  },
  {
    id: "iti",
    title: "Introduction to Software Testing Concepts & Techniques",
    issuer: "ITI Platform",
    issueDate: "20/01/26",
    credentialId: "EITP6DSUGq",
    category: "Web & Frontend",
    skills: ["Software Testing", "Testing Concepts", "Testing Techniques"],
    badgeText: "Completion",
    description:
      "Completion certificate for the Introduction to Software Testing Concepts & Techniques course issued by the ITI Platform.",
    featured: false,
    previewImage: "/assets/certificates/iti-preview.jpg.jpeg",
    file: "/assets/certificates/Certificate iti.pdf",
  },
  {
    id: "database",
    title: "Database Fundamentals",
    issuer: "ITI Platform",
    issueDate: "20/01/26",
    credentialId: "7KalJ2PlJ1",
    category: "Backend & APIs",
    skills: ["Databases", "Database Fundamentals", "SQL"],
    badgeText: "Completion",
    description:
      "Completion certificate for the Database Fundamentals course issued by the ITI Platform.",
    featured: false,
    previewImage: "/assets/certificates/database-preview.jpg.jpeg",
    file: "/assets/certificates/Certificates Database.pdf",
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    issuer: "HackerRank",
    issueDate: "21 Jan, 2026",
    credentialId: "A5E88E74A78D",
    category: "Backend & APIs",
    skills: ["Software Engineering", "Problem Solving", "Programming"],
    badgeText: "Role Certification",
    description:
      "HackerRank role certification confirming that the bearer passed the Software Engineer certification test.",
    featured: false,
    previewImage: "/assets/certificates/swe-preview.jpg.jpeg",
    file: "/assets/certificates/software_engineer certificate-1.pdf",
  },
  {
    id: "software-engineer-intern",
    title: "Software Engineer Intern",
    issuer: "HackerRank",
    issueDate: "01 Mar, 2026",
    credentialId: "0BA671170530",
    category: "Backend & APIs",
    skills: ["Software Engineering", "Problem Solving", "Programming"],
    badgeText: "Role Certification",
    description:
      "HackerRank role certification confirming that the bearer passed the Software Engineer Intern certification test.",
    featured: false,
    previewImage: "/assets/certificates/intern-preview.jpg.jpeg",
    file: "/assets/certificates/software_engineer_intern certificate-1.pdf",
  },
];

export const certificateStats = [
  { value: "6+", label: "Verified Credentials", desc: "Global & Industry Standards" },
  { value: "500+", label: "Learning Hours", desc: "Rigorous Hands-on Practice" },
  { value: "4", label: "Specialized Domains", desc: "Mobile, Web, Backend & AI" },
  { value: "100%", label: "Verified Status", desc: "Active & Credentialed" },
];

export const issuingOrganizations = [
  "Meta",
  "HackerRank",
  "Microsoft Learn",
  "DeepLearning.AI",
  "ICPC Foundation",
  "Academind / Udemy",
];

// Backwards compatibility aliases if needed during transition
export const recognitions = certificates.map((c) => ({
  title: c.title,
  organization: c.issuer,
  badgeText: c.badgeText,
  description: c.description,
}));
export const achievementStats = certificateStats;
export const affiliations = issuingOrganizations;

/* -------------------------------------------------------------------------- */
/* BACKWARDS COMPATIBILITY EXPORT (siteConfig)                                */
/* -------------------------------------------------------------------------- */
export const siteConfig = {
  name: personalInfo.name,
  title: personalInfo.title,
  description: personalInfo.metaDescription,
  url: personalInfo.url,
  links: socialLinks,
};
