import { useRef, useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, BookOpen, FileText, Calendar, FlaskConical, Megaphone, Linkedin, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { homeContent } from "@/data/home";
import { publications } from "@/data/publications";
import { useGSAP } from "@/hooks/useGSAP";
import gsap from "gsap";
import { AnimatedNetwork } from "@/components/AnimatedNetwork";
import { createSlug } from "@/data/team";
import { useTeam } from "@/contexts/TeamContext";
import { useNews } from "@/contexts/NewsContext";
import { usePosters } from "@/contexts/PostersContext";
import { usePublications } from "@/contexts/PublicationsContext";
import { useHome, defaultTickerItems } from "@/contexts/HomeContext";
import { TeamMember } from "@/data/types";
import { normalizeExternalUrl } from "@/lib/utils";

const TeamAvatar = ({ member }: { member: TeamMember }) => {
  const [error, setError] = useState(false);
  const initials = member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const slug = createSlug(member.name);

  return (
    <Link to={`/team/${slug}`} className="relative group rounded-full block transition-transform hover:-translate-y-1 hover:shadow-md">
      {!error && member.image ? (
        <img
          src={member.image}
          alt={member.name}
          onError={() => setError(true)}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-[3px] border-background shadow-sm bg-muted"
        />
      ) : (
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-primary/10 text-primary font-serif font-semibold border-[3px] border-background shadow-sm text-base md:text-xl">
          {initials}
        </div>
      )}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        {member.name}
      </div>
    </Link>
  );
};

/* ── Animated Counter ── */
const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1800; // ms
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <p ref={ref} className="font-serif text-3xl md:text-4xl text-primary mb-1">
      {count}{suffix}
    </p>
  );
};

const getCategoryMeta = (cat: string) => {
  const c = (cat || "").toLowerCase();
  if (c.includes("hackathon")) return { color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400", icon: Sparkles };
  if (c.includes("award")) return { color: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400", icon: Sparkles };
  if (c.includes("news")) return { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400", icon: Megaphone };
  if (c.includes("pub")) return { color: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400", icon: BookOpen };
  if (c.includes("post")) return { color: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400", icon: FileText };
  if (c.includes("event")) return { color: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400", icon: Calendar };
  if (c.includes("soft")) return { color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400", icon: FlaskConical };
  return { color: "bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400", icon: FlaskConical };
};

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { teamMembers, isLoading } = useTeam();
  const { news: newsItems, isLoading: newsLoading } = useNews();
  const { posters, isLoading: postersLoading } = usePosters();
  const { publications: apiPublications, isLoading: apiPubsLoading } = usePublications();
  const { homeData } = useHome();

  const sortedTeamMembers = useMemo(() => {
    const hierarchyOrder: Record<string, number> = {
      leader: 1,
      researcher: 2,
      phd: 3,
      visiting: 4,
      alumni: 5,
    };

    const researcherOrder = ["deepika", "rajesh", "kanchan"];
    const phdOrder = ["jordina", "saurav", "shubh"];

    return [...teamMembers].sort((a, b) => {
      const orderA = hierarchyOrder[a.hierarchy || "researcher"] || 4;
      const orderB = hierarchyOrder[b.hierarchy || "researcher"] || 4;
      if (orderA !== orderB) return orderA - orderB;

      // If they are both researchers, sort by explicit researcher order
      if (a.hierarchy === "researcher" && b.hierarchy === "researcher") {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        let aIdx = researcherOrder.findIndex(n => aName.includes(n));
        let bIdx = researcherOrder.findIndex(n => bName.includes(n));
        if (aIdx === -1) aIdx = 999;
        if (bIdx === -1) bIdx = 999;
        return aIdx - bIdx;
      }

      // If they are both PhD students, sort by explicit PhD order
      if (a.hierarchy === "phd" && b.hierarchy === "phd") {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        let aIdx = phdOrder.findIndex(n => aName.includes(n));
        let bIdx = phdOrder.findIndex(n => bName.includes(n));
        if (aIdx === -1) aIdx = 999;
        if (bIdx === -1) bIdx = 999;
        return aIdx - bIdx;
      }

      return 0; // Maintain original database insertion order for the rest
    });
  }, [teamMembers]);

  useGSAP(() => {
    if (isLoading) return;
    // Hero fade in
    gsap.fromTo(
      heroRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 }
    );

    // Content fade up
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-background relative z-0">
      {/* Subtle Dot Matrix Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>

      <Header />
      <main className="pt-14 md:pt-16 pb-10">

        {/* ── Running Ticker / Announcement Bar ── */}
        <div className="w-full bg-card/60 backdrop-blur-md border-b border-border/40 py-2 overflow-hidden relative z-20 flex items-center shadow-2xs group">
          {/* Sticky Left Badge */}
          <div className="shrink-0 z-30 hidden md:flex items-center gap-2.5 px-5 py-1 bg-background border-r border-border/40 text-[11px] font-mono font-bold uppercase tracking-widest text-primary shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Updates
          </div>

          {/* Right Gradient Fade Mask */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

          {/* Ticker Content */}
          {(() => {
            const activeTickerItems = homeData.tickerItems && homeData.tickerItems.length > 0
              ? homeData.tickerItems
              : defaultTickerItems;

            return (
              <div className="flex whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] items-center">
                <div className="flex gap-6 items-center pl-4">
                  {activeTickerItems.map((item, idx) => {
                    const { color, icon: IconComponent } = getCategoryMeta(item.category);
                    return (
                      <div key={idx} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-background/80 border border-border/50 text-xs font-medium hover:border-primary/40 transition-all duration-300 shadow-2xs shrink-0 cursor-default">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${color}`}>
                          <IconComponent size={12} /> {item.category}
                        </span>
                        <span className="text-foreground/90 font-medium">{item.title}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Duplicate for seamless loop */}
                <div className="flex gap-6 items-center ml-6" aria-hidden="true">
                  {activeTickerItems.map((item, idx) => {
                    const { color, icon: IconComponent } = getCategoryMeta(item.category);
                    return (
                      <div key={`dup-${idx}`} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-background/80 border border-border/50 text-xs font-medium hover:border-primary/40 transition-all duration-300 shadow-2xs shrink-0 cursor-default">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${color}`}>
                          <IconComponent size={12} /> {item.category}
                        </span>
                        <span className="text-foreground/90 font-medium">{item.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── Hero Section with Green Accent Band ── */}
        <section className="relative mb-4 overflow-hidden">
          {/* Green gradient accent band */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/8 via-primary/4 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/6 blur-[100px]" />
          </div>

          {/* Network Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-15 flex justify-center items-center">
            <div className="w-[1200px] h-[600px]">
              <AnimatedNetwork />
            </div>
            {/* Edge fade gradients */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background to-transparent" />
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
          </div>

          <div className="container mx-auto px-6">
            <div ref={heroRef} className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 py-6 md:py-8 items-start animate-fade-in" style={{ opacity: 0 }}>

              {/* Left Column: Hero Content */}
              <div className="lg:col-span-8 flex flex-col items-start text-left">
                <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-4">
                  {homeData.labName} — Research Group
                </p>
                <h1 className="font-serif text-3xl md:text-5xl text-foreground mb-6 font-normal leading-tight">
                  {homeData.tagline || "Computational Toxicology & In-Silico Innovation"}
                </h1>
                <p className="text-muted-foreground text-lg mb-5 max-w-2xl">
                  {homeData.description}
                </p>
                <Link
                  to="/research"
                  className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded shadow-sm hover:bg-primary/90 transition-all hover:-translate-y-0.5 mb-10"
                >
                  Explore Our Research
                </Link>
                {/* Team Avatars Row */}
                <div className="flex flex-wrap justify-start items-center gap-4 mt-4">
                  {sortedTeamMembers.map((member, idx) => (
                    <TeamAvatar key={member.id || idx} member={member} />
                  ))}
                </div>
              </div>

              {/* Right Column: Latest News (Top Right) */}
              <div className="lg:col-span-4 w-full">
                <div className="border border-border/50 rounded-2xl bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-border/40 bg-muted/20">
                    <h2 className="text-lg font-serif text-foreground font-medium">Latest News</h2>
                  </div>

                  <div className="p-6 h-[650px] overflow-hidden relative group/ticker">
                    {/* Fading edges for the ticker */}
                    <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />

                    {newsLoading ? (
                      <div className="py-20 flex justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : newsItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-10">No news available.</p>
                    ) : (
                      <div className="animate-marquee-vertical flex flex-col gap-3">
                        {[...(newsItems.length < 5 ? [...newsItems, ...newsItems, ...newsItems] : [...newsItems, ...newsItems])].map((news, idx) => {
                          const isLinkedIn = Boolean(
                            news.link &&
                            (news.link.includes("linkedin.com") || news.link.includes("lnkd.in"))
                          );

                          const cleanLink = news.link ? normalizeExternalUrl(news.link.split("#author=")[0].split("?author=")[0]) : undefined;

                          return (
                            <div
                              key={news.id ? `${news.id}-${idx}` : idx}
                              className={`p-4 rounded-xl border shrink-0 transition-all duration-200 group ${isLinkedIn
                                ? "border-[#0A66C2]/25 bg-gradient-to-br from-[#0A66C2]/[0.03] to-transparent hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/[0.08]"
                                : idx % 2 === 1
                                  ? "border-border/30 bg-primary/5 hover:border-primary/40 hover:bg-primary/[0.08]"
                                  : "border-border/30 bg-transparent hover:border-border/60 hover:bg-muted/10"
                                }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                                  {news.date}
                                </span>
                                {isLinkedIn && (
                                  <span
                                    title="LinkedIn Post"
                                    className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#0A66C2]/15 text-[#0A66C2] dark:text-[#70b5f9] border border-[#0A66C2]/20 shadow-2xs shrink-0"
                                  >
                                    <Linkedin size={10} className="fill-current shrink-0" />
                                  </span>
                                )}
                              </div>

                              {cleanLink ? (
                                <a
                                  href={cleanLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`font-medium text-foreground leading-snug mb-2 flex items-start justify-between gap-1 transition-colors cursor-pointer ${isLinkedIn
                                    ? "group-hover:text-[#0A66C2] dark:group-hover:text-[#70b5f9]"
                                    : "group-hover:text-primary"
                                    }`}
                                >
                                  <span>{news.title}</span>
                                  <ExternalLink
                                    size={12}
                                    className="shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all mt-1"
                                  />
                                </a>
                              ) : (
                                <h4 className="font-medium text-foreground leading-snug mb-2 group-hover:text-primary transition-colors cursor-pointer">
                                  {news.title}
                                </h4>
                              )}

                              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                {news.description}
                              </p>

                              {isLinkedIn && cleanLink && (
                                <a
                                  href={cleanLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2.5 pt-2 border-t border-[#0A66C2]/15 flex items-center justify-between text-xs text-[#0A66C2] dark:text-[#70b5f9] font-medium hover:underline"
                                >
                                  <span>View on LinkedIn</span>
                                  <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom edge fade */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
        </section>



        {/* ── Main Content Structure ── */}
        <section className="container mx-auto px-6">
          <div ref={contentRef} className="space-y-16">

            {/* About Section */}
            <div className="opacity-0">
              <h2 className="text-2xl font-serif text-foreground border-b border-border pb-3 mb-6">What We Do</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
                {homeData.highlights.map((highlight, index) => (
                  <div key={index} className="p-6 border border-border rounded bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 group">
                    <h3 className="font-serif text-xl font-medium text-foreground mb-3 group-hover:text-primary transition-colors">{highlight.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{highlight.text}</p>
                    {highlight.link && (
                      <Link to={highlight.link} className="text-primary text-sm font-semibold hover:underline">
                        Read More →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Published Posters */}
            <div className="opacity-0">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
                <h2 className="text-2xl font-serif text-foreground">Published Posters</h2>
                <Link to="/posters" className="text-xs font-semibold text-primary uppercase tracking-wider hover:underline">
                  View All Posters →
                </Link>
              </div>

              {postersLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : posters.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8">No posters available yet.</p>
              ) : (
                <div className="flex gap-5 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scrollbar-thin">
                  {posters.map((poster) => {
                    const zenodoId = poster.zenodo_url?.match(/(?:records?\/|zenodo\.)([0-9]+)/i)?.[1];
                    const displayImage = poster.image_url || (zenodoId ? `https://zenodo.org/records/${zenodoId}/thumb400` : null);

                    return (
                      <a
                        key={poster.id || poster.title}
                        href={poster.zenodo_url || poster.pdf_url || "/posters"}
                        target={poster.zenodo_url || poster.pdf_url ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className="group shrink-0 w-[260px] snap-start cursor-pointer block"
                      >
                        <div className="relative overflow-hidden rounded-lg border border-border bg-muted/30 aspect-[3/4] mb-3 group-hover:border-primary/40 group-hover:shadow-lg transition-all duration-300">
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt={poster.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.parentElement!.classList.add("flex", "items-center", "justify-center");
                                const placeholder = document.createElement("div");
                                placeholder.className = "text-center p-4";
                                placeholder.innerHTML = `<div class="text-4xl mb-2">📄</div><p class="text-xs text-muted-foreground">Poster Preview</p>`;
                                target.parentElement!.appendChild(placeholder);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-muted/20">
                              <span className="text-4xl mb-2">📄</span>
                              <span className="text-xs text-muted-foreground font-medium">{poster.conference}</span>
                            </div>
                          )}
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="text-background text-xs font-semibold uppercase tracking-wider">
                              {poster.zenodo_url ? "View on Zenodo →" : "View Poster →"}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-serif text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {poster.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">{poster.conference} ({poster.year})</p>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Publications */}
            <div className="opacity-0">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
                <h2 className="text-2xl font-serif text-foreground">Recent Publications</h2>
                <Link to="/publications" className="text-xs font-semibold text-primary uppercase tracking-wider hover:underline">
                  View All Publications →
                </Link>
              </div>

              {apiPubsLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(apiPublications.length > 0 ? apiPublications : publications).slice(0, 4).map((pub, i) => {
                    const cleanTitle = pub.title
                      .replace(/&lt;/g, "<")
                      .replace(/&gt;/g, ">")
                      .replace(/&amp;/g, "&")
                      .replace(/&quot;/g, '"')
                      .replace(/&#39;/g, "'");

                    return (
                      <li key={pub.id || i} className="text-sm border border-border/50 p-5 rounded-xl bg-card hover:bg-card/80 hover:shadow-md hover:border-primary/30 transition-all group">
                        <a
                          href={pub.doi || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="font-serif text-base font-medium text-foreground group-hover:text-primary transition-colors block mb-2 leading-snug"
                          dangerouslySetInnerHTML={{ __html: cleanTitle }}
                        />
                        {pub.authors && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                            {pub.authors}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider font-mono">
                          {pub.journal} ({pub.year})
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-8 text-center">
                <Link to="/publications" className="inline-block px-6 py-2.5 border border-primary text-primary font-medium text-sm rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shadow-2xs">
                  View All Publications
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-primary/5 rounded-[2rem] p-10 md:p-16 text-center border border-primary/10 relative overflow-hidden">
              {/* Subtle background decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10">
                <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">
                  Interested in collaborating?
                </h2>
                <p className="text-muted-foreground/80 max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
                  We're always looking for partners in computational toxicology, risk assessment, and AI-driven research.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3 rounded-full font-medium text-xs tracking-wider uppercase shadow-sm"
                >
                  Get in touch <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Index;
