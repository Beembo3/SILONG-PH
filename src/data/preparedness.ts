export interface PreparednessSection {
  id: string;
  title: string;
  taglishTitle: string;
  summary: string;
  items: Array<{ title: string; detail: string }>;
}

export const preparednessSections: PreparednessSection[] = [
  {
    id: "before",
    title: "Before extreme heat",
    taglishTitle: "Bago ang matinding init",
    summary:
      "Prepare water, shade, medicine, and a plan for the people most at risk before the hottest part of the day.",
    items: [
      {
        title: "Prepare drinking water",
        detail:
          "Keep clean drinking water available at home, at work, and while travelling. Follow any fluid limits given by your doctor.",
      },
      {
        title: "Plan outdoor activity around heat guidance",
        detail:
          "Move strenuous work, exercise, and long trips away from the hottest hours. Check the current heat category and official advisories first.",
      },
      {
        title: "Prepare clothing and sun protection",
        detail:
          "Use light, loose clothing, a wide-brimmed hat, sunglasses, and shade. Sunscreen helps with sunburn but does not replace cooling and hydration.",
      },
      {
        title: "Check on vulnerable household members",
        detail:
          "Older adults, infants and young children, pregnant people, outdoor workers, and people with chronic illness or disability may need extra help.",
      },
      {
        title: "Identify a cool place and review local guidance",
        detail:
          "Know where you can safely cool down. Use only cooling places whose public access and facilities have been verified, or contact your LGU for official options.",
      },
    ],
  },
  {
    id: "during",
    title: "During extreme heat",
    taglishTitle: "Habang matinding init",
    summary:
      "Reduce exposure, rest often, and act quickly if someone shows signs of heat illness.",
    items: [
      {
        title: "Reduce strenuous outdoor activity",
        detail:
          "When the heat category is dangerous, avoid unnecessary outdoor work and exercise. Follow workplace, school, and local government safety procedures.",
      },
      {
        title: "Rest in a cool or shaded place",
        detail:
          "Use shade, ventilation, fans, air-conditioning, or a verified cooling place. Take frequent breaks instead of waiting until you feel unwell.",
      },
      {
        title: "Drink water regularly",
        detail:
          "Drink before you feel thirsty. Avoid relying on alcohol or sugary drinks for hydration. People with medical fluid restrictions should follow clinical advice.",
      },
      {
        title: "Never leave children or pets in parked vehicles",
        detail:
          "A parked vehicle can become dangerously hot within minutes, even with windows partly open.",
      },
      {
        title: "Look out for one another",
        detail:
          "Check on neighbours and family members who live alone or may not be able to reach a cool place.",
      },
    ],
  },
  {
    id: "illness",
    title: "Recognising possible heat illness",
    taglishTitle: "Pagkilala sa posibleng heat illness",
    summary:
      "Heat exhaustion and heat stroke are not the same. Suspected heat stroke is a medical emergency — call for help immediately.",
    items: [
      {
        title: "Possible heat exhaustion",
        detail:
          "Heavy sweating, weakness, dizziness, headache, nausea, muscle cramps, or fainting. Move the person to a cooler place, loosen clothing, cool the skin, and give water if they are alert and able to swallow. Seek medical advice if symptoms do not improve quickly.",
      },
      {
        title: "Emergency signs of heat stroke",
        detail:
          "High body temperature, confusion, slurred speech, agitation, seizures, loss of consciousness, or collapse. The skin may be hot and dry or still sweating. This is life-threatening.",
      },
      {
        title: "Call emergency services",
        detail:
          "Call 911 or your local emergency service immediately. Begin cooling the person while waiting: move them to shade, remove excess clothing, apply cool water, and fan them. Do not give fluids to someone who is confused or unconscious.",
      },
      {
        title: "Do not delay care",
        detail:
          "Do not wait for an in-app questionnaire, a reply from a moderator, or for symptoms to pass before seeking emergency help.",
      },
    ],
  },
  {
    id: "after",
    title: "After extreme heat",
    taglishTitle: "Pagkatapos ng matinding init",
    summary:
      "Recovery takes time. Continue hydration and seek medical assessment if symptoms persist or return.",
    items: [
      {
        title: "Continue hydration and rest",
        detail:
          "Rehydrate steadily and avoid strenuous activity until you feel fully recovered. Eat regular meals if you can.",
      },
      {
        title: "Seek medical assessment when needed",
        detail:
          "Get checked if symptoms persist, worsen, or return, especially after fainting, confusion, or heat stroke. Some effects can appear after the immediate exposure.",
      },
      {
        title: "Review official advisories before resuming activity",
        detail:
          "Check updated heat forecasts and local guidance before returning to outdoor work, sport, or travel.",
      },
      {
        title: "Report unsafe or inaccurate information",
        detail:
          "If a cooling place listing is wrong or out of date, use the report form on its page so an authorised reviewer can check it.",
      },
    ],
  },
];

export interface SourceReference {
  title: string;
  publisher: string;
  url: string;
  note: string;
}

export const preparednessSources: SourceReference[] = [
  {
    title: "Heat Index",
    publisher: "DOST-PAGASA",
    url: "https://www.pagasa.dost.gov.ph/weather/heat-index",
    note: "Official heat-index categories and heat-index monitoring page.",
  },
  {
    title: "Heat-Related Illnesses",
    publisher: "Department of Health — Cordillera Administrative Region",
    url: "https://caro.doh.gov.ph/heat-related-illnesses/",
    note: "Public-health guidance on heat exhaustion, heat stroke, and prevention.",
  },
  {
    title: "Heat and health",
    publisher: "World Health Organization",
    url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health",
    note: "General information on heat exposure and health risks.",
  },
  {
    title: "PAGASA iHeatMAP",
    publisher: "DOST-PAGASA",
    url: "https://src.panahon.gov.ph/pubfiles/cad/iaas/ihif_new.html",
    note: "Official interactive heat-index reference. SILONG PH does not automatically ingest this map.",
  },
  {
    title: "National Disaster Risk Reduction and Management Council",
    publisher: "NDRRMC",
    url: "https://ndrrmc.gov.ph/",
    note: "National disaster preparedness and response information.",
  },
];

export const MEDICAL_DISCLAIMER =
  "SILONG PH provides general heat-safety education, not medical advice or diagnosis. For suspected heat stroke or another life-threatening emergency, call 911 or local emergency services immediately. Do not delay emergency care to use this application.";
