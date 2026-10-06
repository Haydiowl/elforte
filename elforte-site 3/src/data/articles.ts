export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  listIntro?: string;
  bullets?: string[];
  extraLists?: { intro: string; bullets: string[] }[];
  closing?: string[];
}

export interface Article {
  slug: string;
  aliases?: string[];
  tag: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  date?: string;
  intro?: string[];
  sections?: ArticleSection[];
  body: string[];
}

export const articles: Article[] = [
  {
    slug: "buying-land-first-time",
    tag: "Property Guide",
    title: "Buying Land for the First Time? 7 Things to Check Before You Commit",
    excerpt:
      "Buying land is a major decision. Learn the key things to consider—from location and documentation to accessibility and development plans.",
    image: "/images/blog-1.jpg",
    readTime: "6 min read",
    body: [
      "Buying land is a major decision, especially the first time. Before you commit, it helps to slow down and check the fundamentals that determine whether a plot is right for you.",
      "Start with location. Consider accessibility, road networks, and how the surrounding area is developing. A location with clear growth direction tends to serve both homeowners and long-term investors better.",
      "Next, review documentation. Ask about the title documents, the contract of sale, and the allocation process. Clear documentation reviewed before payment protects you from future disputes.",
      "Check accessibility and development plans for the estate itself. An organized layout, planned infrastructure, and a clear development vision make it easier to build when you are ready.",
      "Finally, inspect before you commit. Visit the site, ask questions, and speak with the property team. If any answer feels unclear, keep asking until it is.",
    ],
  },
  {
    slug: "land-or-house-which-should-you-consider-first",
    aliases: ["land-or-house"],
    tag: "Investment",
    title: "Land or House: Which Should You Consider First?",
    excerpt:
      "Buying property is a major decision, especially when choosing between land and a completed house.",
    image: "/images/property-road.jpg",
    readTime: "5 min read",
    date: "12:40PM. September 29, 2026",
    intro: [
      "Buying property is one of the biggest financial decisions many people make. For some, the goal is to own a ready-to-live-in home. For others, buying land first provides the flexibility to build when the time is right. Neither option is automatically right for everyone. The better choice depends on your budget, purpose, timeline, preferred location, and long-term plans.",
      "Here's what to consider before making your decision",
    ],
    sections: [
      {
        heading: "1. Start With Your Purpose",
        paragraphs: [
          "Before deciding between land and a house, ask yourself:",
          "What am I buying the property for?",
          "If your priority is having a place to live soon, a completed house may make more sense. You can move in or rent it out without waiting through the construction process.",
          "If your priority is securing a location and building gradually, land may give you more flexibility.",
        ],
        listIntro: "For example, you may want to:",
        bullets: [
          "Build your family home in the future",
          "Hold the land as a long-term investment",
          "Develop a rental property",
          "Build a commercial property",
          "Secure land for your children or family",
        ],
        closing: ["Knowing your purpose first makes the rest of the decision much easier."],
      },
      {
        heading: "2. Consider Your Budget",
        paragraphs: [
          "Your available budget can significantly influence your decision. Buying a completed house generally requires a larger upfront commitment, especially in established locations. You are paying for both the land and the completed structure.",
          "With land, there may be an opportunity to purchase the property first and plan construction according to your financial capacity.",
          "However, the purchase price of land is not the only cost to consider.",
        ],
        listIntro: "For land, you may also need to budget for:",
        bullets: [
          "Documentation and legal fees",
          "Surveying",
          "Site preparation",
          "Building plans",
          "Construction",
          "Infrastructure or development charges, where applicable",
        ],
        closing: [
          "Looking at the total cost of ownership, rather than just the initial price, gives you a clearer picture.",
        ],
        extraLists: [
          {
            intro: "For a house, consider:",
            bullets: [
              "Purchase price",
              "Legal and documentation costs",
              "Renovation or repairs",
              "Maintenance",
              "Property taxes or applicable charges",
              "Ongoing utilities",
            ],
          },
        ],
      },
      {
        heading: "3. Think About Location",
        paragraphs: [
          "Location matters whether you are buying land or a house. A house may already exist in an established neighbourhood, giving you a clearer understanding of the surrounding environment, accessibility and available infrastructure.",
          "With land, you may have more flexibility in choosing where you want to build, but you need to carefully research the area before purchasing.",
        ],
        listIntro: "Consider:",
        bullets: [
          "Road accessibility",
          "Nearby schools and healthcare",
          "Commercial activity",
          "Public transportation",
          "Existing infrastructure",
          "Planned developments",
          "Neighbouring communities",
          "Flooding and environmental conditions",
          "The property's accessibility throughout the year",
        ],
        closing: [
          "A property can look affordable on paper and still become expensive or inconvenient if the location does not support your plans.",
        ],
      },
      {
        heading: "4. Land Gives You More Control",
        paragraphs: [
          "One major advantage of buying land is the freedom to decide what you eventually build, subject to applicable planning and building regulations.",
        ],
        listIntro: "You can determine:",
        bullets: [
          "The size and layout of your home",
          "Number of rooms",
          "Finishes and materials",
          "Outdoor spaces",
          "Future extensions",
          "How the property fits your lifestyle",
        ],
        closing: [
          "A completed house gives you less control over the original design, but it gives you something equally valuable: immediate usability.",
          "So the question becomes:",
          "Do you value flexibility more, or do you value readiness?",
        ],
      },
      {
        heading: "5. Consider Your Timeline",
        paragraphs: [
          "Your timeline can also determine which option makes more sense. If you need somewhere to live within the next few months, buying a completed house may be more practical.",
          "If you are planning for the next few years, purchasing land can allow you to secure a location now and develop it later. This is particularly relevant if you have a clear long-term plan but are not yet ready to take on the full cost of construction.",
        ],
      },
    ],
    body: [
      "Buying property is one of the biggest financial decisions many people make. For some, the goal is to own a ready-to-live-in home. For others, buying land first provides the flexibility to build when the time is right.",
    ],
  },
  {
    slug: "land-documentation",
    tag: "Ownership Guide",
    title: "Land Documentation: What Every Buyer Should Understand",
    excerpt:
      "From title documents to agreements and allocation papers, understand the essential property documents you should review before completing a land purchase.",
    image: "/images/property-lot.jpg",
    readTime: "7 min read",
    body: [
      "Documentation is where confident land purchases are made. Before completing any land purchase, make sure you understand the papers involved and what each one proves.",
      "Title documents sit at the center. They speak to ownership history and the legal standing of the land. Always ask which title covers the property you are considering.",
      "Beyond title, expect transaction papers: receipts, a contract of sale capturing the terms of your purchase, and an allocation letter confirming the specific plot assigned to you.",
      "Read every document before you sign, and ask questions about anything unclear. A transparent seller welcomes scrutiny at this stage.",
      "If you are buying with Elforte, our team walks you through each document from inspection to allocation so you know exactly what you are receiving.",
    ],
  },
  {
    slug: "land-survey-before-purchase",
    tag: "Property Guide",
    title: "Why a Land Survey Should Come Before Your Purchase",
    excerpt:
      "Boundaries, beacons, and layout plans all start with a proper survey. Here is why confirming what is on the ground matters before you pay.",
    image: "/images/blog-2.jpg",
    readTime: "5 min read",
    body: [
      "Every plot you consider exists twice: once on paper and once on the ground. A proper land survey is how you confirm the two match.",
      "A survey confirms boundaries, beacons, and the exact position of your plot within the estate layout. It answers the most basic question a buyer can ask: where exactly am I buying?",
      "Ask to see the layout plan and, where possible, walk the land with the property team. Physical beacons, access roads, and neighboring plots tell you things no brochure can.",
      "Be wary of any purchase where the plot cannot be pointed out to you. Clarity at this stage prevents disputes later.",
      "Elforte encourages inspections before commitment so you can see, verify, and understand exactly what you are securing.",
    ],
  },
  {
    slug: "planned-communities-value",
    tag: "Investment",
    title: "How Planned Communities Build Long-Term Value",
    excerpt:
      "Organized layouts, clear development direction, and shared standards shape how an estate grows. Here is what to look for.",
    image: "/images/blog-3.jpg",
    readTime: "6 min read",
    body: [
      "Not all land grows the same way. Estates with an organized layout and a clear development vision tend to mature more predictably than unstructured alternatives.",
      "Look for structure: defined plots, planned access roads, and a layout that leaves room for shared infrastructure as the community fills in.",
      "Shared standards matter too. When every owner builds within a coherent framework, the whole neighborhood holds its character and appeal over time.",
      "Direction matters as much as design. Consider how the surrounding area is developing and whether the estate sits along a path of growth.",
      "Take your time comparing options, and speak with the Elforte team about which of our communities fits your plans.",
    ],
  },
  {
    slug: "inspection-to-allocation",
    tag: "Ownership Guide",
    title: "From Inspection to Allocation: Understanding the Ownership Journey",
    excerpt:
      "What happens between your first site visit and receiving your plot? A clear walkthrough of each step in the ownership journey.",
    image: "/images/hero-aerial.jpg",
    readTime: "6 min read",
    body: [
      "For first-time buyers, the path from interest to ownership can feel unclear. Breaking it into steps makes the whole journey easier to navigate.",
      "It starts with inspection. Visit the estate, see the available plots, and ask every question on your mind. This is your chance to understand the location firsthand.",
      "Next comes documentation review. Go through the title papers, the contract of sale, and the payment terms carefully before making any commitment.",
      "After payment, allocation confirms your specific plot. Keep every receipt and document issued at this stage in a safe place.",
      "Throughout the process, stay in close contact with the property team. Clear communication at each step is what turns a purchase into confident ownership.",
    ],
  },
];

export function getArticle(slug: string | undefined): Article | undefined {
  return articles.find((a) => a.slug === slug || a.aliases?.includes(slug ?? ""));
}
