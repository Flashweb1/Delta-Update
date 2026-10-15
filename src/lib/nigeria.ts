export const NIGERIAN_STATES = [
  "Abia State",
  "Adamawa State",
  "Akwa Ibom State",
  "Anambra State",
  "Bauchi State",
  "Bayelsa State",
  "Benue State",
  "Borno State",
  "Cross River State",
  "Delta State",
  "Ebonyi State",
  "Edo State",
  "Ekiti State",
  "Enugu State",
  "Gombe State",
  "Imo State",
  "Jigawa State",
  "Kaduna State",
  "Kano State",
  "Katsina State",
  "Kebbi State",
  "Kogi State",
  "Kwara State",
  "Lagos State",
  "Nasarawa State",
  "Niger State",
  "Ogun State",
  "Ondo State",
  "Osun State",
  "Oyo State",
  "Plateau State",
  "Rivers State",
  "Sokoto State",
  "Taraba State",
  "Yobe State",
  "Zamfara State",
  "Federal Capital Territory (Abuja)",
] as const;

export const NEWS_DESKS = [
  "All Nigeria",
  "National News",
  "Politics & Public Affairs",
  "Business & Economy",
  "Cities & Communities",
  "Energy & Environment",
  "Security & Justice",
  "Sports & Athletics",
  "Culture & Lifestyle",
  "Delta & Niger Delta",
] as const;

export const NIGERIA_REGION_FILTERS = [
  "All Nigeria",
  "Nationwide",
  ...NIGERIAN_STATES,
] as const;

const DELTA_LOCATION_TERMS = [
  "delta",
  "warri",
  "asaba",
  "effurun",
  "uvwie",
  "oshimili",
  "ughelli",
  "sapele",
  "ethiope",
  "agbor",
  "ndokwa",
  "isoko",
  "burutu",
  "bomadi",
  "anioma",
  "escravos",
  "abraka",
  "oghara",
  "kwale",
];

export function matchesNewsRegion(
  selectedRegion: string,
  location: string,
  title = "",
  summary = "",
) {
  if (selectedRegion === "All Nigeria") return true;

  const normalizedLocation = location.toLowerCase();
  if (selectedRegion === "Nationwide") {
    return normalizedLocation.includes("nationwide") || normalizedLocation.includes("all nigeria");
  }

  if (selectedRegion === "Delta State") {
    if (DELTA_LOCATION_TERMS.some((term) => normalizedLocation.includes(term))) return true;
    return (
      normalizedLocation === "statewide" &&
      /delta state|warri|asaba|ughelli|sapele|effurun/i.test(`${title} ${summary}`)
    );
  }

  if (selectedRegion === "Federal Capital Territory (Abuja)") {
    return /federal capital territory|abuja|\bfct\b/i.test(location);
  }

  return normalizedLocation.includes(selectedRegion.toLowerCase());
}

export function matchesNewsDesk(
  selectedDesk: string,
  articleCategory: string,
  location: string,
  title = "",
  summary = "",
) {
  if (selectedDesk === "All Nigeria") return true;

  const category = articleCategory.toLowerCase();
  if (selectedDesk === "Delta & Niger Delta") {
    return matchesNewsRegion("Delta State", location, title, summary);
  }
  if (selectedDesk === "National News") {
    return category.includes("national") || location.toLowerCase().includes("nationwide");
  }
  if (selectedDesk === "Politics & Public Affairs") {
    return category.includes("politic") || category.includes("public affairs");
  }
  if (selectedDesk === "Business & Economy") {
    return category.includes("business") || category.includes("economy");
  }
  if (selectedDesk === "Cities & Communities") {
    return category.includes("metro") || category.includes("communit") || category.includes("cities");
  }
  if (selectedDesk === "Energy & Environment") {
    return category.includes("energy") || category.includes("environment") || category.includes("oil");
  }
  if (selectedDesk === "Security & Justice") {
    return category.includes("security") || category.includes("justice") || category.includes("maritime");
  }
  if (selectedDesk === "Sports & Athletics") {
    return category.includes("sport") || category.includes("athletic");
  }
  if (selectedDesk === "Culture & Lifestyle") {
    return category.includes("culture") || category.includes("lifestyle") || category.includes("entertainment");
  }

  return articleCategory === selectedDesk;
}
