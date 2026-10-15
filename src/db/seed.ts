import { db } from "./index";
import { articles, categories, comments, newsletterSubscribers, siteConfig } from "./schema";
import { count, eq } from "drizzle-orm";
import { articleInsertRow, normalizeTickers, type ArticleInput } from "@/lib/view";

export async function seedDatabase() {
  try {
    const [{ value: articleCount }] = await db.select({ value: count() }).from(articles);
    if (articleCount > 0) {
      return { message: "Database already contains articles.", count: articleCount, skipped: true };
    }

    // Seed Categories
    await db.insert(categories).values([
      { name: "Delta Politics", slug: "delta-politics", emoji: "🏛️", description: "Government house, policy, elections, and civic updates across Delta State", color: "#0b2545", ord: 1, visible: true },
      { name: "Warri & Asaba Metro", slug: "warri-asaba-metro", emoji: "🏙️", description: "Urban life, community news, and developments in Delta's twin metropolitan hubs", color: "#b91c1c", ord: 2, visible: true },
      { name: "Oil & Energy", slug: "oil-energy", emoji: "🛢️", description: "Niger Delta petroleum developments, gas monetization, offshore rigs, and local content", color: "#1e3a8a", ord: 3, visible: true },
      { name: "Business & Economy", slug: "business-economy", emoji: "📈", description: "Maritime trade, agro-business, SMEs, markets, and regional commerce", color: "#047857", ord: 4, visible: true },
      { name: "Security & Maritime", slug: "security-maritime", emoji: "⚓", description: "Waterways safety, community policing, Joint Task Force reports, and peace initiatives", color: "#991b1b", ord: 5, visible: true },
      { name: "Sports & Athletics", slug: "sports", emoji: "🏅", description: "Warri Wolves, Stephen Keshi Stadium events, National Youth Games, Delta athletics", color: "#d97706", ord: 6, visible: true },
      { name: "Culture & Entertainment", slug: "culture-lifestyle", emoji: "🎭", description: "Delta festivals, comedy, music, Anioma, Urhobo, Itsekiri, Ijaw and Isoko cultural heritage", color: "#7c3aed", ord: 7, visible: true },
    ]).onConflictDoNothing();

    // Seed Breaking Tickers into site_config.breaking_news (jsonb)
    const [config] = await db
      .select({ breakingNews: siteConfig.breakingNews })
      .from(siteConfig)
      .where(eq(siteConfig.id, 1));

    if (config && normalizeTickers(config.breakingNews).length === 0) {
      const createdAt = new Date().toISOString();
      await db
        .update(siteConfig)
        .set({
          breakingNews: [
            { id: "seed-1", text: "BREAKING: Delta State Executive Council Approves N78 Billion for Upgraded Drainage Infrastructure in Asaba and Warri metropolis.", priority: 1, isActive: true, createdAt, link: null },
            { id: "seed-2", text: "COMMERCE: NNPCL and Delta Energy Hub Ink MoU on 150MW Gas-to-Power Plant in Ogidigben Gas Revolution Park.", priority: 2, isActive: true, createdAt, link: null },
            { id: "seed-3", text: "SPORTS: Stephen Keshi Stadium Asaba set to host 2026 West African Athletics Invitational this weekend.", priority: 3, isActive: true, createdAt, link: null },
            { id: "seed-4", text: "EDUCATION: Delta State Government disburses 2025/2026 Bursary and Special Scholarship awards to 24,000 tertiary students.", priority: 4, isActive: true, createdAt, link: null },
          ],
          updatedAt: new Date(),
        })
        .where(eq(siteConfig.id, 1));
    }

    // Seed Articles (written in the site's view shape, mapped to DB rows below)
    const SEED_ARTICLES: (ArticleInput & { slug: string })[] = [
      {
        title: "Governor Oborevwori Inaugurates Historic Warri & Effurun Flyover Interchange Projects to Eliminate Gridlock",
        slug: "governor-oborevwori-inaugurates-warri-effurun-flyover-projects",
        summary: "The flagship multi-billion naira Julius Berger flyover intersections at Enerhen Junction, PTI Junction, and DSC Roundabout officially open, dramatically speeding up urban commerce in Delta's commercial hub.",
        content: `WARRI, DELTA STATE — In what residents and business leaders are hailing as an urban transport watershed, the Delta State Government officially inaugurated the major flyovers and dual-carriageway expansions across Effurun, PTI Junction, and the Warri commercial axis.

Addressing thousands of citizens, traditional rulers, and economic stakeholders gathered near the PTI corridor, Governor Sheriff Oborevwori reaffirmed that the 'MORE Agenda' remains laser-focused on restoring the economic glory of Warri, Effurun, and neighboring oil-bearing communities.

"Our administration made an unyielding pledge to rebuild Warri and give our economic capital the world-class infrastructure it truly deserves," the Governor stated to thunderous applause. "These flyovers, engineered with top global standards by Julius Berger Nigeria Plc, will eliminate hours of crippling traffic, reduce freight costs, and draw global commerce back into Delta State."

Urban planners estimate that the new traffic corridors will reduce transit times between Warri Port, DSC Industrial layout, and the commercial business district by over 70%, unlocking estimated annual productivity gains exceeding N45 billion for local logistics and market retailers.

Community leaders and market women associations from Igbudu Market and Enerhen praised the timely delivery of the project, urging for continued maintenance and urban lighting along the expanded corridors.`,
        category: "Warri & Asaba Metro",
        lga: "Uvwie / Warri South",
        authorName: "Festus Ehigiator",
        authorRole: "Bureau Chief, Delta Central",
        imageUrl: "/images/delta-updates-hero.jpg",
        isBreaking: true,
        isFeatured: true,
        views: 4892,
        likes: 312,
        shares: 145,
        readTime: "4 min read",
        status: "published",
      },
      {
        title: "Niger Delta Gas Industrialization: Escravos and Kwale Gas Hubs Secure $520M Clean Energy Consortium Backing",
        slug: "niger-delta-gas-industrialization-escravos-kwale-clean-energy-520m",
        summary: "A coalition of international and indigenous energy operators commit over half a billion dollars to expand LPG processing, domestic gas pipeline interconnectivity, and flare commercialization.",
        content: `ASABA — Delta State's strategic position as Nigeria's premier hydrocarbon basin received another monumental boost today with the announcement of a $520 million private-public consortium investment aimed at domestic gas monetization.

The initiative, headquartered across facilities in Escravos (Warri South-West) and Kwale (Ndokwa West), aims to capture previously flared gas and convert it into liquefied petroleum gas (LPG) for millions of Nigerian homes and compressed natural gas (CNG) for mass public transport fleets.

Delta State Commissioner for Energy underscored that the investment aligns with Nigeria's Decades of Gas agenda while securing immediate local benefits:
- Creation of over 3,800 direct technical and engineering jobs in Delta communities
- Guaranteed royalty dividends and dedicated community development funds managed under PIA frameworks
- 250 megawatts of captive power distribution for industrial clusters in Sapele and Agbor

Energy analysts have hailed Delta State's peaceful host-community engagement protocols, citing them as a benchmark for oil-producing states across the Gulf of Guinea.`,
        category: "Oil & Energy",
        lga: "Warri South-West & Ndokwa West",
        authorName: "Chukwudi Nnamdi",
        authorRole: "Senior Energy & Petroleum Editor",
        imageUrl: "https://images.pexels.com/photos/10396415/pexels-photo-10396415.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isBreaking: false,
        isFeatured: true,
        views: 3241,
        likes: 184,
        shares: 89,
        readTime: "5 min read",
        status: "published",
      },
      {
        title: "Asaba International Airport Cargo Terminal Set for Full Export Operations: Direct Agricultural Freight to Europe",
        slug: "asaba-international-airport-cargo-terminal-direct-export-europe",
        summary: "Delta farmers and agro-exporters prepare for direct weekly cargo flights from Asaba to London and Amsterdam, shipping fresh yam, plantain, palm oil, and high-value vegetables.",
        content: `ASABA, OSHIMILI SOUTH — The Asaba International Airport concessionaires alongside the Delta State Ministry of Agriculture have finalized clearance protocols with the Nigerian Export Promotion Council (NEPC) for the maiden weekly agro-cargo export flights.

Equipped with a newly commissioned 5,000 metric-ton cold chain facility and automated quarantine inspection bays, the Asaba cargo terminal will serve as the logistical springboard for agro-commodities produced across Delta, Edo, Anambra, and Imo states.

"Delta's yam tubers from Agbor, plantains from Isoko and Ethiope, and processed palm oil will now arrive in overseas supermarkets within 24 hours of harvest," remarked the concessionaire's Managing Director during a demonstration walk-through.

Local agricultural cooperatives have expressed strong enthusiasm, noting that reducing dependence on congested Lagos access corridors will cut post-harvest transit losses from 35% down to under 3%.`,
        category: "Business & Economy",
        lga: "Oshimili South (Asaba)",
        authorName: "Blessing Oghenero",
        authorRole: "Agribusiness & Maritime Correspondent",
        imageUrl: "https://images.pexels.com/photos/38513265/pexels-photo-38513265.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isBreaking: false,
        isFeatured: true,
        views: 2980,
        likes: 247,
        shares: 110,
        readTime: "4 min read",
        status: "published",
      },
      {
        title: "Joint Maritime Security Taskforce Intercepts Illegal Oil Vessels Off Benin River, Restoring Estuary Safety",
        slug: "joint-maritime-security-intercepts-vessels-benin-river",
        summary: "Coordinated naval patrols and digital satellite surveillance dismantle crude siphoning network in Delta coastal waterways, winning commendation from riverside communities.",
        content: `KOKO, WARRI NORTH — In an operation praised for its precision and zero civilian casualties, the Joint Task Force Operation Delta Safe intercepted three modified bunkering barges attempting to siphon crude off the Benin River estuary.

Naval authorities confirmed that over 1.2 million liters of stolen product were secured, and 14 suspects were handed over to federal prosecution agencies alongside maritime navigation logs.

The traditional ruler of the neighboring kingdom expressed relief, noting that the crackdowns are also safeguarding the fragile mangrove ecosystem and fish stocks upon which thousands of riverine families depend for daily livelihoods.`,
        category: "Security & Maritime",
        lga: "Warri North",
        authorName: "Tarebi Doubra",
        authorRole: "Defence & Maritime Affairs",
        imageUrl: "https://images.pexels.com/photos/15010364/pexels-photo-15010364.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isBreaking: true,
        isFeatured: false,
        views: 2150,
        likes: 198,
        shares: 72,
        readTime: "3 min read",
        status: "published",
      },
      {
        title: "Delta State Assembly Passes Landmark Youth Tech Empowerment and Innovation Hub Bill",
        slug: "delta-state-assembly-passes-youth-tech-empowerment-bill",
        summary: "The newly approved legislation mandates 5 dedicated technology incubators across Asaba, Warri, Ughelli, Ozoro, and Agbor with tax incentives for tech startups.",
        content: `ASABA — The Delta State House of Assembly has unanimously passed the Delta Youth Innovation & Digital Economy Bill into law, paving the way for state-funded silicon hubs and specialized software development training programs.

Spearheaded by young lawmakers, the bill establishes:
1. Seed funding grants of up to N5,000,000 for certified tech startups headquartered in Delta State
2. Subsidized high-speed fiber broadband in student innovation hubs around DELSU, UNIDEL, and Delta State Polytechnic campuses
3. Annual Delta Hackathon with partnerships from international technology giants

The Speaker of the House commended Governor Oborevwori for his progressive vision in ensuring that Delta's youths lead the African digital revolution.`,
        category: "Delta Politics",
        lga: "Statewide",
        authorName: "Kome Okotie",
        authorRole: "Legislative Affairs Correspondent",
        imageUrl: "https://images.pexels.com/photos/15920138/pexels-photo-15920138.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isBreaking: false,
        isFeatured: false,
        views: 1870,
        likes: 165,
        shares: 94,
        readTime: "3 min read",
        status: "published",
      },
      {
        title: "Warri Wolves Roar to Victory in 3-1 Thriller Against Bendel Insurance, Solidifying Continental Qualification Hopes",
        slug: "warri-wolves-victory-bendel-insurance-npfl-derby",
        summary: "Electrifying atmosphere in Asaba as the Seasiders dominate the South-South derby with a spectacular brace from home-grown striker Oghenebrume.",
        content: `ASABA, STEPHEN KESHI STADIUM — In front of 18,000 roaring fans, Warri Wolves put on a masterclass in tactical discipline and attacking flair, securing a resounding 3-1 victory over regional rivals Bendel Insurance.

Forward sensation Emmanuel Oghenebrume opened scoring in the 14th minute with a thunderous 25-yard curling strike into the top corner. Despite an equalizer in the second half, Wolves captain Anthony Okon finished a slick 6-pass counterattack before Oghenebrume completed his brace from the penalty spot.

With this crucial derby win, Warri Wolves move to second place on the league table, in prime position to bring CAF Confederation Cup football back to Delta State next season.`,
        category: "Sports & Athletics",
        lga: "Oshimili South / Warri South",
        authorName: "Ovie Akpevwe",
        authorRole: "Sports Desk Editor",
        imageUrl: "https://images.pexels.com/photos/5632274/pexels-photo-5632274.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isBreaking: false,
        isFeatured: false,
        views: 4120,
        likes: 540,
        shares: 230,
        readTime: "3 min read",
        status: "published",
      },
      {
        title: "Urhobo Progress Union & Anioma Cultural Congress Announce Historic Unity Heritage Festival in Delta Central",
        slug: "urhobo-anioma-unity-cultural-heritage-festival-delta",
        summary: "A week-long celebration of folklore, gastronomy, classical highlife music, and peaceful coexistence set to bring over 50,000 tourists to Abraka and Asaba.",
        content: `ABRAKA, ETHIOPE EAST — In a landmark cultural display, the apex socio-cultural bodies of Delta State announced the joint Delta Cultural Unity Festival 2026.

Taking place along the scenic banks of the crystal-clear River Ethiope in Abraka, the festival will showcase traditional boat regattas, royal drum exhibitions, authentic culinary contests (including Delta Banga and Owo soup masterclasses), and theatrical enactments of Niger Delta folklore.

"Our diversity is our greatest wealth," proclaimed the festival coordination committee. "From Anioma to Urhobo, Isoko, Itsekiri, and Ijaw, we stand as one peaceful, progressive family proud of our ancestral traditions."`,
        category: "Culture & Entertainment",
        lga: "Ethiope East (Abraka)",
        authorName: "Onome Ejiro",
        authorRole: "Arts & Culture Feature Writer",
        imageUrl: "/images/delta-newsroom.jpg",
        isBreaking: false,
        isFeatured: false,
        views: 2650,
        likes: 310,
        shares: 118,
        readTime: "4 min read",
        status: "published",
      },
      {
        title: "Delta Teaching Hospital Oghara Commissions World-Class Cardiac Catheterization Laboratory",
        slug: "delsuth-oghara-commissions-cardiac-catheterization-lab",
        summary: "Patients in the South-South region will no longer need overseas medical trips for complex heart angioplasties and pacemaker implants.",
        content: `OGHARA, ETHIOPE WEST — The Delta State University Teaching Hospital (DELSUTH), Oghara, has officially commissioned a state-of-the-art bi-plane Cardiac Catheterization Laboratory, establishing Delta as an advanced medical tourism hub in West Africa.

The N1.8 billion facility features ultra-high-definition coronary angiography imaging, digital hemodynamics monitors, and an intensive cardiac care unit equipped with ventilator backups.

Chief Medical Director announced that a team of visiting diaspora Nigerian interventional cardiologists alongside resident surgeons successfully executed the first four minimally invasive coronary stent surgeries this week, all with 100% success rate and zero complications.`,
        category: "Warri & Asaba Metro",
        lga: "Ethiope West (Oghara)",
        authorName: "Dr. Evelyn Osagie",
        authorRole: "Health & Science Correspondent",
        imageUrl: "https://images.pexels.com/photos/6950226/pexels-photo-6950226.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isBreaking: false,
        isFeatured: false,
        views: 2210,
        likes: 275,
        shares: 104,
        readTime: "4 min read",
        status: "published",
      },
    ];

    const seededArticles = await db
      .insert(articles)
      .values(SEED_ARTICLES.map((article) => articleInsertRow(article, article.slug)))
      .returning({ id: articles.id, slug: articles.slug });

    const articleIdBySlug = new Map(seededArticles.map((row) => [row.slug, row.id]));

    // Seed sample Comments
    const SEED_COMMENTS: { slug: string; author: string; authorEmail: string; location: string; body: string }[] = [
      {
        slug: "governor-oborevwori-inaugurates-warri-effurun-flyover-projects",
        author: "Engr. Kenneth Mofe",
        authorEmail: "kenneth.mofe@example.com",
        location: "Warri, Delta State",
        body: "The flyover at PTI junction has reduced my daily commute from 1 hour 45 minutes down to less than 15 minutes! Kudos to Governor Sheriff Oborevwori and Julius Berger.",
      },
      {
        slug: "governor-oborevwori-inaugurates-warri-effurun-flyover-projects",
        author: "Grace Omo-Ovie",
        authorEmail: "grace.omoovie@example.com",
        location: "Effurun, Delta State",
        body: "Delta Updates always brings the most verified reports first! The street lighting at night along the new corridor looks world-class.",
      },
      {
        slug: "niger-delta-gas-industrialization-escravos-kwale-clean-energy-520m",
        author: "Prince Austin Efedua",
        authorEmail: "austin.efedua@example.com",
        location: "Kwale, Ndokwa West",
        body: "This $520M gas investment must strictly prioritize local host-community youths for technical internships and employment. Great reporting Delta Updates.",
      },
      {
        slug: "asaba-international-airport-cargo-terminal-direct-export-europe",
        author: "Chief Daniel Okereke",
        authorEmail: "daniel.okereke@example.com",
        location: "Asaba, Delta State",
        body: "Direct flights for agro-produce from Asaba to Europe will transform our farmers' income. No more driving trucks in Lagos traffic for days.",
      },
    ];

    const commentValues = SEED_COMMENTS.flatMap((seed) => {
      const articleId = articleIdBySlug.get(seed.slug);
      if (!articleId) return [];
      return [
        {
          articleId,
          articleTitle: SEED_ARTICLES.find((article) => article.slug === seed.slug)?.title ?? seed.slug,
          author: seed.author,
          authorEmail: seed.authorEmail,
          authorLocation: seed.location,
          body: seed.body,
          status: "approved" as const,
        },
      ];
    });

    if (commentValues.length > 0) {
      await db.insert(comments).values(commentValues);
    }

    // Seed sample Subscribers
    await db.insert(newsletterSubscribers).values([
      { email: "editor@deltaupdates.ng", active: true },
      { email: "warri.reader@gmail.com", active: true },
      { email: "sapele.biz@yahoo.com", active: true },
    ]).onConflictDoNothing();

    return { message: "Database successfully seeded with Delta State news!", count: seededArticles.length };
  } catch (error) {
    console.error("Seeding error:", error);
    throw error;
  }
}
