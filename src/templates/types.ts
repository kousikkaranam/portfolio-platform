
export interface PortfolioData {
  user: {
    name: string;
    image: string | null;
    slug: string;
    githubUsername: string | null;
  };
  settings: {
    siteTitle: string | null;
    tagline: string | null;
    bio: string | null;
    heroImageUrl: string | null;
    resumeUrl: string | null;
    location: string | null;
    availableForHire: boolean;
    socialLinks: {
      github?: string;
      linkedin?: string;
      twitter?: string;
      instagram?: string;
      youtube?: string;
      email?: string;
      phone?: string;
      phoneCode?: string;
      customLinkLabel?: string;
      customLinkUrl?: string;
      contactTitle?: string;
      contactMessage?: string;
      heroImageShape?: "circle" | "rounded" | "square";
      heroImageSize?: "sm" | "md" | "lg";
      heroImageEffect?: "none" | "glow" | "spin-ring";
      darkBg?: string;
      lightBg?: string;
      lightAccent?: string;
    } | null;
    theme: string;
    accentColor: string;
    metaTitle: string | null;
    metaDescription: string | null;
  };
  skills: Array<{
    id: string;
    category: string;
    name: string;
    iconUrl: string | null;
    proficiency: number | null;
    displayOrder: number;
  }>;
  experiences: Array<{
    id: string;
    company: string;
    role: string;
    description: string | null;
    companyLogoUrl: string | null;
    location: string | null;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    techStack: string[];
    githubUrl: string | null;
    displayOrder: number;
  }>;
  projects: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    longDescription: string | null;
    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    thumbnailUrl: string | null;
    category: string | null;
    isFeatured: boolean;
    status: string;
  }>;
  engineering: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    content: string | null;
    techStack: string[];
    diagramUrl: string | null;
    impact: string | null;
    isFeatured: boolean;
    status: string;
  }>;
  blogPosts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImageUrl: string | null;
    tags: string[];
    readTimeMin: number | null;
    status: string;
    publishedAt: string | null;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string | null;
    field: string | null;
    startYear: number | null;
    endYear: number | null;
    description: string | null;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string | null;
    issueDate: string | null;
    credentialUrl: string | null;
  }>;
  customSections: Array<{
    id: string;
    title: string;
    content: string | null;
    isVisible: boolean;
    displayOrder: number;
  }>;
  sections: {
    showSkills: boolean;
    showExperience: boolean;
    showProjects: boolean;
    showEngineering: boolean;
    showBlog: boolean;
    showEducation: boolean;
    showCertifications: boolean;
    showGithub: boolean;
    showContact: boolean;
    sectionOrder: string[];
  };
}