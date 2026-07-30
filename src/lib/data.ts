export const siteConfig = {
  name: "Ahmed ElGabbas",
  title: "Ahmed ElGabbas — Full-Stack Developer & Mobile Engineer",
  description:
    "Ahmed ElGabbas — Full-Stack Software Engineer & Mobile Application Developer. Building scalable systems with React, Next.js, Flutter, and .NET. Available for hire.",
  url: "https://ahmedelgabbas.dev",
  links: {
    github: "https://github.com/Elagbbas",
    linkedin: "https://www.linkedin.com/in/ahmed-elgabbas-33a186344",
    twitter: "https://x.com/A7med_ElGabbas",
    facebook: "https://www.facebook.com/share/17dLWSBhAa/",
    email: "ahmedelgabbas769@gmail.com",
    phone: "+201117024500",
  },
};

export const stats = [
  { value: "2+", label: "Years Experience" },
  { value: "15+", label: "Projects Completed" },
  { value: "8+", label: "Technologies" },
  { value: "500+", label: "Problems Solved" },
];

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
    period: "2023 — 2027",
    description:
      "Specializing in Robotics Software Engineering. Coursework includes Data Structures, Algorithms, OOP, Database Systems, Software Engineering, and AI fundamentals.",
    gpa: "Currently pursuing",
  },
];

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
    skills: [
      "Node.js",
      "Express.js",
      "ASP.NET Core",
      "Django",
      "REST APIs",
    ],
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

export const recognitions = [
  {
    title: "ICPC Community Member",
    organization: "HNU-FCSIT ICPC Community",
    description:
      "Active member of the HR Committee at the ICPC competitive programming community, organizing events and recruiting new members.",
  },
  {
    title: "Student Union Leader",
    organization: "HNU-FCSIT Student Union",
    description:
      "Head of Sports Committee, managing sports events, building team spirit, and fostering collaborative environments across the faculty.",
  },
  {
    title: "Problem Solver",
    organization: "Competitive Programming",
    description:
      "Solved 500+ algorithmic problems across platforms like Codeforces, LeetCode, and HackerRank, strengthening analytical and problem-solving skills.",
  },
];

export const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Qualifications", href: "#journey" },
  { label: "Projects", href: "#projects" },
  { label: "Certificates", href: "#certificates" },
  { label: "Contact", href: "#contact" },
];