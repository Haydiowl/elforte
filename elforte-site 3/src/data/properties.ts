export type PropertyStatus = "available" | "closed";

export interface WhyPoint {
  heading: string;
  text: string;
}

export interface PropertyDetail {
  heroImage: string;
  aboutTitle: string;
  about: string[];
  whyTitle: string;
  why: WhyPoint[];
  whoTitle: string;
  whoIntro: string;
  who: string[];
  moveTitle: string;
  move: string[];
}

export interface Property {
  slug: string;
  name: string;
  displayName: string;
  location: string;
  description: string;
  longDescription: string;
  image: string;
  category: string;
  landType: string;
  status: PropertyStatus;
  statusLabel: string;
  detail: PropertyDetail;
}

export const properties: Property[] = [
  {
    slug: "signature-city",
    name: "Signature city",
    displayName: "Signature City",
    location: "Omu ikoko",
    description:
      "A thoughtfully planned residential estate offering well-positioned plots, organized infrastructure, and space to build your future.",
    longDescription:
      "Signature City is a thoughtfully planned residential estate offering well-positioned plots, organized infrastructure, and space to build your future. Explore available plots and speak with our property team about ownership, documentation, and payment plans.",
    image: "/images/change-gate.png",
    category: "Buy",
    landType: "Land",
    status: "available",
    statusLabel: "Available",
    detail: {
      heroImage: "/images/change-gate.png",
      aboutTitle: "About Signature City",
      about: [
        "Owning property starts with choosing the right foundation.",
        "Signature City was created for people who want to secure a piece of land with the freedom to build according to their own plans, whether that means creating a family home, developing an investment property, or holding land for the future.",
        "Rather than rushing into a property purchase, buyers can take the time to understand the location, inspect the property, review the available documentation, and make a decision that fits their plans.",
      ],
      whyTitle: "Why Signature City?",
      why: [
        {
          heading: "A Place to Build",
          text: "Create a home or development that reflects your needs, lifestyle, and long-term plans.",
        },
        {
          heading: "An Opportunity to Invest",
          text: "Secure property today and position yourself for potential long-term value as the surrounding area develops.",
        },
        {
          heading: "A Planned Community",
          text: "The estate is designed with an organized layout and a clear vision for its development.",
        },
        {
          heading: "A Property You Can Understand",
          text: "From inspection to documentation, buyers can get the information they need before making a commitment.",
        },
      ],
      whoTitle: "Who Is Signature City For?",
      whoIntro: "Signature City can be considered by:",
      who: [
        "First-time land buyers",
        "Families planning a future home",
        "Property investors",
        "Individuals looking to secure land early",
        "Buyers looking for long-term property opportunities",
      ],
      moveTitle: "Make Your Move",
      move: [
        "You don't have to have everything figured out before taking the first step.",
        "Visit Signature City, explore the available plots, ask your questions, and speak with the Elforte team about your options.",
      ],
    },
  },
  {
    slug: "itunu-gardens",
    name: "Itunu Gardens",
    displayName: "Itunu Gardens",
    location: "Ago Iwoye",
    description:
      "A growing residential community designed for comfortable living, accessible ownership, and long-term development.",
    longDescription:
      "Itunu Gardens is a growing residential community designed for comfortable living, accessible ownership, and long-term development. Visit the site, explore available plots, and choose an option that fits your plans.",
    image: "/images/property-road.jpg",
    category: "Buy",
    landType: "Land",
    status: "available",
    statusLabel: "Available",
    detail: {
      heroImage: "/images/property-road.jpg",
      aboutTitle: "About Itunu Gardens",
      about: [
        "Owning property starts with choosing the right foundation.",
        "Itunu Gardens was created for people who want to secure a piece of land with the freedom to build according to their own plans, whether that means creating a family home, developing an investment property, or holding land for the future.",
        "Rather than rushing into a property purchase, buyers can take the time to understand the location, inspect the property, review the available documentation, and make a decision that fits their plans.",
      ],
      whyTitle: "Why Itunu Gardens?",
      why: [
        {
          heading: "A Place to Build",
          text: "Create a home or development that reflects your needs, lifestyle, and long-term plans.",
        },
        {
          heading: "An Opportunity to Invest",
          text: "Secure property today and position yourself for potential long-term value as the surrounding area develops.",
        },
        {
          heading: "A Planned Community",
          text: "The estate is designed with an organized layout and a clear vision for its development.",
        },
        {
          heading: "A Property You Can Understand",
          text: "From inspection to documentation, buyers can get the information they need before making a commitment.",
        },
      ],
      whoTitle: "Who Is Itunu Gardens For?",
      whoIntro: "Itunu Gardens can be considered by:",
      who: [
        "First-time land buyers",
        "Families planning a future home",
        "Property investors",
        "Individuals looking to secure land early",
        "Buyers looking for long-term property opportunities",
      ],
      moveTitle: "Make Your Move",
      move: [
        "You don't have to have everything figured out before taking the first step.",
        "Visit Itunu Gardens, explore the available plots, ask your questions, and speak with the Elforte team about your options.",
      ],
    },
  },
  {
    slug: "blossom-city",
    name: "Blossom City",
    displayName: "Blossom City",
    location: "Ikorodu",
    description:
      "Discover available plots within Blossom City and find an option that fits your plans, location preferences, and ownership goals.",
    longDescription:
      "Blossom City is now sold out and no longer available for purchase. Explore Signature City and Itunu Gardens instead.",
    image: "/images/property-lot.jpg",
    category: "Buy",
    landType: "Land",
    status: "closed",
    statusLabel: "Closed / Completed",
    detail: {
      heroImage: "/images/property-lot.jpg",
      aboutTitle: "About Blossom City",
      about: [
        "Owning property starts with choosing the right foundation.",
        "Blossom City was created for people who wanted to secure a piece of land with the freedom to build according to their own plans, whether that meant creating a family home, developing an investment property, or holding land for the future.",
        "This estate is now closed and completed. Speak with the Elforte team about Signature City and Itunu Gardens instead.",
      ],
      whyTitle: "Why Blossom City?",
      why: [
        {
          heading: "A Place to Build",
          text: "Created for homes and developments reflecting owners' needs, lifestyle, and long-term plans.",
        },
        {
          heading: "An Opportunity to Invest",
          text: "Positioned for potential long-term value as the surrounding area develops.",
        },
        {
          heading: "A Planned Community",
          text: "The estate was designed with an organized layout and a clear vision for its development.",
        },
        {
          heading: "A Property You Can Understand",
          text: "From inspection to documentation, buyers got the information they needed before making a commitment.",
        },
      ],
      whoTitle: "Who Was Blossom City For?",
      whoIntro: "Blossom City was considered by:",
      who: [
        "First-time land buyers",
        "Families planning a future home",
        "Property investors",
        "Individuals looking to secure land early",
        "Buyers looking for long-term property opportunities",
      ],
      moveTitle: "Make Your Move",
      move: [
        "Blossom City is sold out, but your journey does not have to end here.",
        "Explore Signature City and Itunu Gardens, ask your questions, and speak with the Elforte team about your options.",
      ],
    },
  },
];

export const availableProperties = properties.filter((p) => p.status === "available");

export const landOptions = ["Land", "Buildings", "Shops"];
export const categoryOptions = ["Buy", "Sale", "Rent"];

export function getProperty(slug: string | undefined): Property | undefined {
  return properties.find((p) => p.slug === slug);
}
