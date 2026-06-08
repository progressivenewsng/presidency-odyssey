export type PostFlag = "MAIN_STORY" | "EDITORS_PICK" | "FEATURED" | "TRENDING" | "POPULAR" | "BREAKING_NEWS";

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  author: string;
  date: string;
  imageUrl?: string;
  flags: PostFlag[]; // Replaces multiple boolean fields with array
  excerpt?: string;
}

const mockNews: NewsItem[] = [
  {
    id: "1",
    slug: "shettima-rallies-borno-apc-for-unity",
    title: "Shettima Rallies Borno APC for Unity as Gubio Emerges Governorship Candidate",
    category: "Politics",
    content: "Vice President Kashim Shettima has returned to Abuja after participating in the All Progressives Congress governorship primary in Borno State. He urged all party faithful to close ranks and focus on delivering victory in the forthcoming elections. The emergence of the candidate is a strong signal of the party's unity in the state...",
    author: "Mofi Aluko",
    date: "May 22, 2026",
    flags: ["MAIN_STORY", "POPULAR"],
    excerpt: "VP Shettima calls for unity as APC governorship candidate emerges in Borno State."
  },
  {
    id: "2",
    slug: "nigeria-and-poland-strengthen-ties",
    title: "Nigeria and Poland Strengthen Ties in Digital Economy, Defence and Agriculture",
    category: "Economy",
    content: "Nigeria and the Republic of Poland are exploring stronger cooperation in key sectors, including digital economy, defence, agriculture, and ship-building. The bilateral meetings aim to improve both nations' economic prospects...",
    author: "Mofi Aluko",
    date: "May 21, 2026",
    flags: ["EDITORS_PICK", "TRENDING"],
    excerpt: "Nigeria and Poland explore cooperation in digital economy, defence, and agriculture."
  },
  {
    id: "3",
    slug: "presidency-reaffirms-tinubus-commitment",
    title: "Presidency Reaffirms Tinubu's Commitment to National Unity and Constitutional Order",
    category: "Politics",
    content: "The Presidency has reassured Nigerians that President Bola Ahmed Tinubu remains committed to national unity, constitutional democracy and responsible governance. He assured the public that all reform agendas are on track.",
    author: "Mofi Aluko",
    date: "May 21, 2026",
    flags: ["EDITORS_PICK"],
    excerpt: "President Tinubu reaffirms commitment to national unity and constitutional democracy."
  },
  {
    id: "4",
    slug: "tinubu-hails-ndleas-major-breakthrough",
    title: "Tinubu Hails NDLEA's Major Breakthrough Against International Drug Network",
    category: "Security",
    content: "President Bola Ahmed Tinubu has commended the National Drug Law Enforcement Agency for a major success in dismantling a sophisticated international drug syndicate operating within the country.",
    author: "Mofi Aluko",
    date: "May 20, 2026",
    flags: ["EDITORS_PICK"],
    excerpt: "President Tinubu commends NDLEA for dismantling international drug syndicate."
  },
  {
    id: "5",
    slug: "first-lady-champions-womens-growth",
    title: "First Lady Champions Women's Growth and Excellence in Public Service",
    category: "Politics",
    content: "Nigeria's First Lady, Senator Oluremi Tinubu, has emphasized the importance of empowering women in the public service as a major tool for inclusive governance.",
    author: "Mofi Aluko",
    date: "May 19, 2026",
    flags: ["FEATURED"],
    excerpt: "First Lady advocates for women's empowerment in public service."
  },
  {
    id: "6",
    slug: "joint-us-nigeria-air-operations",
    title: "Joint US-Nigeria Air Operations Record Major Security Gains in Borno",
    category: "Politics",
    content: "The Defence Headquarters has announced a major success in ongoing counterterrorism operations, with more than 20 ISIS/ISWAP fighters reportedly neutralised following a joint intelligence-led air strike.",
    author: "Mofi Aluko",
    date: "May 21, 2026",
    flags: ["TRENDING"],
    excerpt: "Joint US-Nigeria operations neutralise 20+ ISIS fighters in Borno."
  },
  {
    id: "7",
    slug: "tinubu-welcomes-airbus-investment",
    title: "Tinubu Welcomes Airbus Investment Plan to Boost Nigeria's Aviation",
    category: "Economy",
    content: "President Bola Ahmed Tinubu has welcomed Airbus' proposal to establish maintenance and hangar facilities in Nigeria, describing it as a massive boost to the aviation sector.",
    author: "Mofi Aluko",
    date: "May 21, 2026",
    flags: ["POPULAR", "FEATURED"],
    excerpt: "Airbus proposal to establish maintenance facilities welcomed by President Tinubu."
  },
  {
    id: "8",
    slug: "tinubu-assures-oyo-families",
    title: "Tinubu Assures Oyo Families of Strong Federal Support in Rescue Efforts",
    category: "Politics",
    content: "President Bola Tinubu has assured the government and people of Oyo State that the Federal Government is working closely with state agencies to combat recent security challenges and provide relief.",
    author: "Mofi Aluko",
    date: "May 20, 2026",
    flags: ["FEATURED"],
    excerpt: "President Tinubu assures Oyo State of federal support in security efforts."
  },
  {
    id: "9",
    slug: "tinubus-reforms-will-build-stronger-economy",
    title: "Tinubu's Reforms Will Build a Stronger Economy, APC Chairman Says",
    category: "Politics",
    content: "National Chairman of the All Progressives Congress has assured Nigerians that the economic reforms introduced by Mr. President are already showing positive signs of stabilizing the economy.",
    author: "Mofi Aluko",
    date: "May 21, 2026",
    flags: ["FEATURED"],
    excerpt: "APC Chairman says Tinubu's economic reforms are stabilizing the economy."
  }
];

// Helper functions to check flags (replaces the old boolean fields)
export function hasFlag(item: NewsItem, flag: PostFlag): boolean {
  return item.flags.includes(flag);
}

export async function getAllNews() {
  // Simulating DB fetch
  return mockNews;
}

export async function getNewsBySlug(slug: string) {
  // Simulating DB fetch
  return mockNews.find(news => news.slug === slug);
}

// Helper functions to replace the old filter logic
export function getMainStory() {
  return mockNews.find(item => hasFlag(item, "MAIN_STORY"));
}

export function getEditorsPicks() {
  return mockNews.filter(item => hasFlag(item, "EDITORS_PICK")).slice(0, 3);
}

export function getFeaturedStories() {
  return mockNews.filter(item => hasFlag(item, "FEATURED")).slice(0, 4);
}

export function getTrendingStories() {
  return mockNews.filter(item => hasFlag(item, "TRENDING")).slice(0, 2);
}

export function getPopularStories() {
  return mockNews.filter(item => hasFlag(item, "POPULAR")).slice(0, 4);
}
