import type { Article, BreakingTicker } from "@/lib/view";

const now = Date.now();
const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000);

type RawArticle = Omit<Article, "id" | "tags" | "publishedAt" | "createdAt" | "updatedAt"> & {
  id: number;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const RAW_ARTICLES: RawArticle[] = [
  {
    id: 1,
    slug: "oborevwori-inaugurates-warri-effurun-flyover-interchange",
    title: "Oborevwori Opens Warri–Effurun Flyover Interchange, Easing a Decade of Gridlock",
    summary:
      "Two Julius Berger flyover intersections at Enerhen Junction and the Effurun roundabout are now open, cutting peak-hour travel times and reopening commercial arteries across the twin cities.",
    content:
      "The long-awaited Warri–Effurun flyover interchange was formally commissioned on Tuesday, bringing an end to years of congestion that had choked one of the busiest commercial corridors in the Niger Delta.\n\nThe project, delivered by Julius Berger Nigeria, introduces grade-separated intersections at Enerhen Junction and the Effurun roundabout. State officials say the design will remove the single largest bottleneck on the Warri–Sapele road, a route used by thousands of commuters and haulage trucks every day.\n\n\"This is not just concrete and steel. It is the return of time to our people,\" the governor said during the ceremony, adding that the interchange forms part of a wider urban mobility master plan for the state.\n\nTraders around Enerhen market welcomed the opening, describing it as a relief after years of unpredictable traffic. Transport unions expect trip times between Warri and Effurun to fall by nearly half during peak hours.\n\nEngineers say the interchange includes dedicated pedestrian walkways, solar-powered street lighting and a drainage system designed for the high rainfall typical of the region.",
    category: "Cities & Communities",
    lga: "Uvwie, Delta State",
    authorName: "Festus Ehigiator",
    authorRole: "Bureau Chief, Delta Central",
    imageUrl:
      "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200",
    isBreaking: true,
    isFeatured: true,
    views: 4892,
    likes: 312,
    shares: 145,
    readTime: "4 min read",
    status: "published",
    publishedAt: hoursAgo(1),
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
  },
  {
    id: 2,
    slug: "niger-delta-gas-industrialisation-520m-clean-energy",
    title: "Niger Delta Gas Sector Attracts $520m in Fresh Clean-Energy Backing",
    summary:
      "International and indigenous operators have committed more than half a billion dollars to expand LPG processing and gas-to-power capacity across the region.",
    content:
      "A consortium of international and indigenous energy firms has pledged over $520 million toward expanding liquefied petroleum gas (LPG) processing and gas-to-power generation in the Niger Delta.\n\nThe investment is expected to raise domestic cooking-gas supply, reduce flare volumes and create jobs in host communities. Operators say the funding will also support a 150-megawatt gas-to-power plant serving industrial clusters.\n\nAnalysts note that the region continues to offer some of the most attractive returns in Africa's gas value chain, especially as government policy shifts toward cleaner fuel incentives.\n\nCommunity leaders have called for transparent benefit-sharing arrangements, including vocational training and local procurement targets, as the projects move into the construction phase.",
    category: "Energy & Environment",
    lga: "Warri South-West, Delta State",
    authorName: "Chukwudi Nnamdi",
    authorRole: "Senior Energy & Petroleum Editor",
    imageUrl:
      "https://images.pexels.com/photos/10396415/pexels-photo-10396415.jpeg?auto=compress&cs=tinysrgb&w=1200",
    isBreaking: false,
    isFeatured: true,
    views: 3241,
    likes: 184,
    shares: 89,
    readTime: "5 min read",
    status: "published",
    publishedAt: hoursAgo(3),
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
  },
  {
    id: 3,
    slug: "asaba-airport-cargo-terminal-export-operations",
    title: "Asaba Cargo Terminal Cleared for Direct Weekly Export Flights",
    summary:
      "Farmers and agribusinesses across the state are preparing for direct weekly cargo flights to London and Amsterdam as the new terminal nears full operation.",
    content:
      "The cargo terminal at Asaba International Airport has been certified for full export operations, clearing the way for direct weekly freighter flights to European markets.\n\nExporters say the facility will transform the economics of perishable produce, allowing farmers to move fresh yams, palm oil and specialty crops to buyers abroad without routing through congested southern airports.\n\n\"The difference is measured in hours, and for perishables hours are money,\" said one agribusiness manager at the terminal.\n\nAirport authorities plan an initial schedule of two departures each week, with capacity to scale as demand grows. The state export promotion agency is supporting smallholder cooperatives with packaging and certification clinics ahead of the first flights.",
    category: "Business & Economy",
    lga: "Oshimili South, Delta State",
    authorName: "Blessing Oghenero",
    authorRole: "Agribusiness & Maritime Correspondent",
    imageUrl:
      "https://images.pexels.com/photos/38513265/pexels-photo-38513265.jpeg?auto=compress&cs=tinysrgb&w=1200",
    isBreaking: false,
    isFeatured: true,
    views: 2980,
    likes: 247,
    shares: 110,
    readTime: "4 min read",
    status: "published",
    publishedAt: hoursAgo(5),
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
  },
  {
    id: 4,
    slug: "maritime-taskforce-intercepts-illegal-oil-vessels-benin-river",
    title: "Joint Taskforce Intercepts Six Illegal Oil Vessels Off Benin River",
    summary:
      "Coordinated naval patrols dismantled a crude-siphoning network in the Delta waterways, seizing vessels and equipment valued at millions of naira.",
    content:
      "A joint maritime security taskforce has intercepted six vessels suspected of involvement in illegal crude oil siphoning along the Benin River and adjoining creeks.\n\nThe operation, spanning three days, also recovered pumping equipment, hoses and makeshift storage tanks. Security officials described the network as one of the most organised dismantled in the area this year.\n\nCommanders said the patrols were intelligence-led and involved cooperation between the navy, marine police and community informants.\n\nLocal fishing communities have asked authorities to ensure that legitimate livelihoods are not disrupted, while welcoming efforts to reduce pollution linked to illegal refining.",
    category: "Security & Justice",
    lga: "Warri North, Delta State",
    authorName: "Ifeanyi Okonkwo",
    authorRole: "Security Correspondent",
    imageUrl:
      "https://images.pexels.com/photos/15010364/pexels-photo-15010364.jpeg?auto=compress&cs=tinysrgb&w=1200",
    isBreaking: false,
    isFeatured: false,
    views: 2150,
    likes: 198,
    shares: 76,
    readTime: "3 min read",
    status: "published",
    publishedAt: hoursAgo(7),
    createdAt: hoursAgo(7),
    updatedAt: hoursAgo(7),
  },
  {
    id: 5,
    slug: "tax-reform-bill-states-fiscal-autonomy-debate",
    title: "Governors Seek Clearer Revenue Sharing as Tax Reform Debate Intensifies",
    summary:
      "State executives across the six geopolitical zones are pushing for a clearer derivation and consumption-based sharing formula ahead of the bill's next reading.",
    content:
      "Governors from across Nigeria are urging a review of revenue-sharing provisions in the proposed tax reform package, arguing that states need greater fiscal certainty to plan long-term development.\n\nThe debate centres on how value-added tax and related revenues should be distributed, with proposals to weight consumption more heavily.\n\nFiscal analysts say the outcome will shape the finances of state governments for years, particularly in states with large informal economies.\n\nA technical committee is expected to present revised recommendations before the next legislative reading, while civil-society groups continue to call for public hearings.",
    category: "Politics & Public Affairs",
    lga: "Abuja, FCT",
    authorName: "Amina Bello",
    authorRole: "National Politics Editor",
    imageUrl:
      "https://images.pexels.com/photos/15920138/pexels-photo-15920138.jpeg?auto=compress&cs=tinysrgb&w=1200",
    isBreaking: false,
    isFeatured: false,
    views: 5120,
    likes: 401,
    shares: 233,
    readTime: "4 min read",
    status: "published",
    publishedAt: hoursAgo(9),
    createdAt: hoursAgo(9),
    updatedAt: hoursAgo(9),
  },
  {
    id: 6,
    slug: "kano-grain-market-exports-west-africa-trade",
    title: "Kano Grain Traders Expand Exports Across West African Markets",
    summary:
      "Improved storage and cross-border logistics are helping northern cooperatives sell sesame, sorghum and groundnut to buyers in Niger, Ghana and beyond.",
    content:
      "Grain traders in Kano are expanding exports across West Africa, helped by new storage investment and smoother cross-border logistics under regional trade arrangements.\n\nCooperatives report growing demand for sesame, sorghum and groundnut, with buyers in Niger, Ghana and Côte d'Ivoire among the most active.\n\nThe market association is training members on quality grading and export documentation, steps it says are essential to fetching premium prices.\n\nEconomists say strengthening the agricultural value chain is one of the most promising paths to job creation in the region.",
    category: "Business & Economy",
    lga: "Kano, Kano State",
    authorName: "Sani Abdullahi",
    authorRole: "Northern Bureau Correspondent",
    imageUrl:
      "https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=1200",
    isBreaking: false,
    isFeatured: false,
    views: 1830,
    likes: 132,
    shares: 54,
    readTime: "3 min read",
    status: "published",
    publishedAt: hoursAgo(12),
    createdAt: hoursAgo(12),
    updatedAt: hoursAgo(12),
  },
  {
    id: 7,
    slug: "lagos-yaba-tech-cluster-software-jobs",
    title: "Yaba Tech Cluster Adds Hundreds of Software Jobs as Startups Scale",
    summary:
      "A new wave of Nigerian startups is hiring engineers, designers and analysts in Lagos, with several firms now serving clients across Africa and Europe.",
    content:
      "Lagos's Yaba technology cluster is adding hundreds of software jobs as a new wave of startups scale up, buoyed by local talent and rising demand from overseas clients.\n\nFounders say the pipeline of engineering, design and data talent keeps improving, though competition for experienced staff remains intense.\n\nSeveral companies in the cluster now serve customers across Africa and Europe, and a growing number are building products for global markets.\n\nIndustry groups are calling for stronger links between universities and employers to keep the momentum going.",
    category: "National News",
    lga: "Ikeja, Lagos State",
    authorName: "Tolu Adeyemi",
    authorRole: "Technology & Innovation Correspondent",
    imageUrl:
      "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200",
    isBreaking: false,
    isFeatured: false,
    views: 2740,
    likes: 219,
    shares: 97,
    readTime: "3 min read",
    status: "published",
    publishedAt: hoursAgo(15),
    createdAt: hoursAgo(15),
    updatedAt: hoursAgo(15),
  },
  {
    id: 8,
    slug: "rivers-state-modular-refinery-local-refining-capacity",
    title: "Rivers Modular Refinery Begins Test Run, Boosting Local Refining",
    summary:
      "The plant is expected to cut the region's reliance on imported refined products and create skilled jobs once commercial output begins.",
    content:
      "A modular refinery in Rivers State has begun test runs, a milestone expected to boost local refining capacity and reduce the region's reliance on imported refined products.\n\nOperators say the plant will process crude from nearby fields, producing diesel, naphtha and heavy fuel oil for the domestic market.\n\nCommunity stakeholders described the project as a model for value retention, adding that local content targets have been broadly met during construction.\n\nRegulators will assess the test-phase output before granting approval for full commercial production.",
    category: "Energy & Environment",
    lga: "Port Harcourt, Rivers State",
    authorName: "Grace Amadi",
    authorRole: "South-South Energy Correspondent",
    imageUrl:
      "https://images.pexels.com/photos/2570059/pexels-photo-2570059.jpeg?auto=compress&cs=tinysrgb&w=1200",
    isBreaking: false,
    isFeatured: false,
    views: 1620,
    likes: 121,
    shares: 43,
    readTime: "3 min read",
    status: "published",
    publishedAt: hoursAgo(18),
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(18),
  },
  {
    id: 9,
    slug: "enugu-athletics-invitational-young-sprinters-shine",
    title: "Enugu Athletics Invitational Unearths a New Generation of Sprinters",
    summary:
      "Teenage athletes from across the South East posted personal bests at a regional meet designed to feed national development programmes.",
    content:
      "Teenage sprinters from across the South East delivered standout performances at the Enugu Athletics Invitational, a regional meet designed to identify talent for national development programmes.\n\nCoaches praised the depth of the field, with several athletes posting personal bests in the 100m and 200m events.\n\nOrganisers said the meet is part of a broader effort to rebuild grassroots athletics and give young athletes more competitive exposure.\n\nScouts from state sports councils attended, with a number of athletes invited to regional training camps.",
    category: "Sports & Athletics",
    lga: "Enugu, Enugu State",
    authorName: "Uche Eze",
    authorRole: "Sports Correspondent",
    imageUrl:
      "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1200",
    isBreaking: false,
    isFeatured: false,
    views: 1450,
    likes: 176,
    shares: 61,
    readTime: "2 min read",
    status: "published",
    publishedAt: hoursAgo(21),
    createdAt: hoursAgo(21),
    updatedAt: hoursAgo(21),
  },
  {
    id: 10,
    slug: "calabar-carnival-boosts-tourism-creative-economy",
    title: "Calabar Arts Season Lifts Tourism and the Creative Economy",
    summary:
      "Hotels, artisans and performers report a strong season as the city's cultural calendar draws visitors from across the country and beyond.",
    content:
      "Calabar's arts season has delivered a strong boost to tourism and the creative economy, with hotels, artisans and performers reporting healthy demand.\n\nCultural festivals across the city drew visitors from across Nigeria and beyond, filling venues and lifting local trade.\n\nOrganisers say the events give young creatives a platform to earn from music, dance, fashion and visual art.\n\nState tourism officials are working to extend the season and improve transport links to sustain the momentum.",
    category: "Culture & Lifestyle",
    lga: "Calabar, Cross River State",
    authorName: "Efio-Anwan Bassey",
    authorRole: "Culture & Lifestyle Writer",
    imageUrl:
      "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1200",
    isBreaking: false,
    isFeatured: false,
    views: 2040,
    likes: 288,
    shares: 132,
    readTime: "3 min read",
    status: "published",
    publishedAt: hoursAgo(26),
    createdAt: hoursAgo(26),
    updatedAt: hoursAgo(26),
  },
];

export const MOCK_ARTICLES: Article[] = RAW_ARTICLES.map((article) => ({
  ...article,
  id: `00000000-0000-4000-8000-${String(article.id).padStart(12, "0")}`,
  tags: [article.lga],
  publishedAt: article.publishedAt.toISOString(),
  createdAt: article.createdAt.toISOString(),
  updatedAt: article.updatedAt.toISOString(),
}));

type RawTicker = Omit<BreakingTicker, "id" | "createdAt"> & { id: number; createdAt: Date };

const RAW_TICKERS: RawTicker[] = [
  {
    id: 1,
    text: "Delta State Executive Council approves N78 billion drainage and flood-control programme",
    link: null,
    isActive: true,
    priority: 3,
    createdAt: hoursAgo(1),
  },
  {
    id: 2,
    text: "NNPC and Delta energy hub sign MoU for 150MW gas-to-power plant",
    link: null,
    isActive: true,
    priority: 2,
    createdAt: hoursAgo(2),
  },
  {
    id: 3,
    text: "Stephen Keshi Stadium, Asaba to host 2026 West African Athletics Invitational",
    link: null,
    isActive: true,
    priority: 2,
    createdAt: hoursAgo(4),
  },
  {
    id: 4,
    text: "Federal allocation to states rises for a third consecutive month, finance ministry confirms",
    link: null,
    isActive: true,
    priority: 1,
    createdAt: hoursAgo(6),
  },
];

export const MOCK_TICKERS: BreakingTicker[] = RAW_TICKERS.map((ticker) => ({
  ...ticker,
  id: `00000000-0000-4000-9000-${String(ticker.id).padStart(12, "0")}`,
  createdAt: ticker.createdAt.toISOString(),
}));

export type PollSnapshot = {
  question: string;
  options: string[];
  results: Record<string, number>;
  totalVotes: number;
};

export const MOCK_POLL: PollSnapshot = {
  question: "Which issue should get the most attention from state governments this year?",
  options: ["Infrastructure", "Security", "Healthcare", "Education"],
  results: { Infrastructure: 418, Security: 265, Healthcare: 302, Education: 189 },
  totalVotes: 1174,
};
