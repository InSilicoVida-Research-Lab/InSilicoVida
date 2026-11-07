import React, { createContext, useContext, useState, useEffect } from "react";
import { homeContent as defaultHomeContent } from "@/data/home";
import { supabase } from "@/lib/supabase";

export interface HighlightItem {
  title: string;
  text: string;
  link: string;
}

export interface TickerItem {
  category: string;
  title: string;
}

export interface HomeData {
  labName: string;
  tagline: string;
  description: string;
  bannerImage: string;
  highlights: HighlightItem[];
  tickerItems: TickerItem[];
}

interface HomeContextType {
  homeData: HomeData;
  isLoading: boolean;
  updateHomeData: (newContent: Partial<HomeData>) => Promise<{ success: boolean; error?: string }>;
}

const STORAGE_KEY = "insilicovida_home_content";

export const defaultTickerItems: TickerItem[] = [
  {
    category: "Hackathon",
    title: "PARC Modellers Hackathon 2026: 12 researchers across Europe collaborate on Agentic AI & FAIR PBPK modeling",
  },
  {
    category: "Award",
    title: "Deepika Deepika wins Special Poster Award at EUROTOX 2026 Vienna for 100-chemical PBPK benchmark",
  },
  {
    category: "Publication",
    title: "New study evaluating generic httk vs specialized compound-specific PBPK models in risk assessment",
  },
  {
    category: "Research",
    title: "Advancing AI-driven QSAR-to-PBPK pipelines & AOP ontologies within the European PARC initiative",
  },
  {
    category: "Software",
    title: "Open-source R & Python pipelines for high-throughput IVIVE and toxicokinetic simulations",
  },
  {
    category: "News",
    title: "Welcoming our new researchers and PhD candidates to the InSilico Vida team!",
  },
];

const initialData: HomeData = {
  labName: defaultHomeContent.labName || "InSilico Vida",
  tagline: "Computational Modeling for Health Risk Assessment",
  description: defaultHomeContent.description,
  bannerImage: "",
  highlights: defaultHomeContent.highlights,
  tickerItems: defaultTickerItems,
};

const HomeContext = createContext<HomeContextType>({
  homeData: initialData,
  isLoading: false,
  updateHomeData: async () => ({ success: true }),
});

export const HomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [homeData, setHomeData] = useState<HomeData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If cached ticker items contain old dummy items, replace with modern defaultTickerItems
        const isLegacyDummy = parsed.tickerItems?.some((t: TickerItem) =>
          t.title?.includes("Organophosphate Flame Retardants") ||
          t.title?.includes("Joint Seminar on Computational Toxicology with DTU")
        );
        if (isLegacyDummy || !parsed.tickerItems || parsed.tickerItems.length === 0) {
          parsed.tickerItems = defaultTickerItems;
        }
        return { ...initialData, ...parsed };
      } catch (e) {
        return initialData;
      }
    }
    return initialData;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch from Supabase home_content table if it exists
  const fetchHomeData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("home_content").select("*").single();
      if (!error && data) {
        const fetchedData: HomeData = {
          labName: data.lab_name || initialData.labName,
          tagline: data.tagline || initialData.tagline,
          description: data.description || initialData.description,
          bannerImage: data.banner_image || initialData.bannerImage,
          highlights: data.highlights || initialData.highlights,
          tickerItems: (data.ticker_items && data.ticker_items.length > 0) ? data.ticker_items : defaultTickerItems,
        };
        setHomeData(fetchedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedData));
      }
    } catch (e) {
      console.warn("Supabase home_content fetch fallback to local:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const updateHomeData = async (updates: Partial<HomeData>) => {
    try {
      const updated = { ...homeData, ...updates };
      setHomeData(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Try updating Supabase home_content single row if table exists
      try {
        await supabase.from("home_content").upsert({
          id: 1,
          lab_name: updated.labName,
          tagline: updated.tagline,
          description: updated.description,
          banner_image: updated.bannerImage,
          highlights: updated.highlights,
          ticker_items: updated.tickerItems,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        // Fallback to local storage if DB row not present
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <HomeContext.Provider value={{ homeData, isLoading, updateHomeData }}>
      {children}
    </HomeContext.Provider>
  );
};

export const useHome = () => useContext(HomeContext);
