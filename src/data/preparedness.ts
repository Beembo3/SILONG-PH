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
    title: "Bago ang matinding init",
    taglishTitle: "Bago lumala ang init",
    summary:
      "Maghanda ng tubig, lilim, gamot, at plano para sa mga pinaka-madaling maapektuhan bago pa uminit nang todo.",
    items: [
      {
        title: "Maghanda ng inuming tubig",
        detail:
          "Panatilihing may malinis na inuming tubig sa bahay, trabaho, at kapag naglalakbay. Sundin ang limitasyon sa fluids na ibinigay ng doktor mo.",
      },
      {
        title: "Iplano ang gawain sa labas ayon sa init",
        detail:
          "Ilayo ang mabigat na trabaho, exercise, at mahabang biyahe sa pinakamainit na oras. Tingnan muna ang heat category at opisyal na abiso.",
      },
      {
        title: "Maghanda ng damit at proteksyon sa araw",
        detail:
          "Gumamit ng maluwag at magaan na damit, wide-brimmed hat, sunglasses, at lilim. Nakakatulong ang sunscreen sa sunburn pero hindi ito kapalit ng paglamig at pag-inom ng tubig.",
      },
      {
        title: "Kamustahin ang mga mas madaling maapektuhan",
        detail:
          "Maaaring kailangan ng dagdag na tulong ang matatanda, sanggol at bata, buntis, outdoor workers, at may sakit o disability.",
      },
      {
        title: "Alamin ang preskong lugar at lokal na payo",
        detail:
          "Alamin kung saan ka ligtas na puwedeng magpalamig. Gamitin lang ang mga lugar na beripikado ang public access at pasilidad, o makipag-ugnayan sa LGU para sa opisyal na opsyon.",
      },
    ],
  },
  {
    id: "during",
    title: "Habang matinding init",
    taglishTitle: "Habang mainit",
    summary:
      "Bawasan ang pagbibilad, magpahinga nang madalas, at kumilos agad kapag may sintomas ng heat illness.",
    items: [
      {
        title: "Bawasan ang mabigat na gawain sa labas",
        detail:
          "Kapag mapanganib ang heat category, iwasan ang hindi kailangang trabaho at exercise sa labas. Sundin ang safety procedure ng trabaho, paaralan, at LGU.",
      },
      {
        title: "Magpahinga sa malamig o may lilim na lugar",
        detail:
          "Gumamit ng lilim, bentilasyon, electric fan, air-conditioning, o beripikadong cooling place. Magpahinga nang madalas bago pa makaramdam ng sama ng pakiramdam.",
      },
      {
        title: "Uminom ng tubig nang regular",
        detail:
          "Uminom bago ka mauhaw. Huwag umasa sa alak o matatamis na inumin para sa hydration. Sundin ang payo ng doktor kung may limitasyon ka sa fluids.",
      },
      {
        title: "Huwag iwanan ang bata o alagang hayop sa sasakyan",
        detail:
          "Puwedeng uminit nang mapanganib ang nakaparadang sasakyan sa loob ng ilang minuto, kahit bahagyang nakabukas ang bintana.",
      },
      {
        title: "Mag-alalayan",
        detail:
          "Kamustahin ang kapitbahay at kapamilyang mag-isa o maaaring hindi makarating sa malamig na lugar.",
      },
    ],
  },
  {
    id: "illness",
    title: "Pagkilala sa posibleng heat illness",
    taglishTitle: "Mga sintomas na dapat abangan",
    summary:
      "Magkaiba ang heat exhaustion at heat stroke. Emergency ang pinaghihinalaang heat stroke — tumawag agad ng tulong.",
    items: [
      {
        title: "Posibleng heat exhaustion",
        detail:
          "Sobrang pagpapawis, panghihina, pagkahilo, sakit ng ulo, pagduduwal, muscle cramps, o pagkahimatay. Ilipat sa mas malamig na lugar, luwagan ang damit, palamigin ang balat, at bigyan ng tubig kung gising at kaya niyang lumunok. Humingi ng medical advice kung hindi agad gumanda ang pakiramdam.",
      },
      {
        title: "Emergency signs ng heat stroke",
        detail:
          "Mataas na body temperature, pagkalito, hindi malinaw ang pagsasalita, pagkabalisa, seizures, pagkawala ng malay, o pagbagsak. Puwedeng mainit at tuyo ang balat o pawisan pa rin. Delikado ito sa buhay.",
      },
      {
        title: "Tumawag ng emergency services",
        detail:
          "Tumawag agad sa 911 o lokal na emergency service. Habang naghihintay, simulan ang pagpapalamig: ilipat sa lilim, alisin ang sobrang damit, basain ng malamig na tubig, at pamaypayan. Huwag bigyan ng fluids ang taong nalilito o walang malay.",
      },
      {
        title: "Huwag ipagpaliban ang tulong",
        detail:
          "Huwag hintayin ang sagot sa app, reply ng moderator, o paglipas ng sintomas bago humingi ng emergency help.",
      },
    ],
  },
  {
    id: "after",
    title: "Pagkatapos ng matinding init",
    taglishTitle: "Pagkatapos ng init",
    summary:
      "Kailangan ng panahon ang pag-recover. Magpatuloy sa hydration at magpatingin sa doktor kung bumabalik o tumatagal ang sintomas.",
    items: [
      {
        title: "Magpatuloy sa hydration at pahinga",
        detail:
          "Uminom ng tubig nang tuloy-tuloy at iwasan ang mabigat na gawain hanggang sa maramdaman mong fully recovered ka na. Kumain ng regular kung kaya.",
      },
      {
        title: "Magpatingin kung kailangan",
        detail:
          "Magpatingin kung tumatagal, lumalala, o bumabalik ang sintomas, lalo na pagkatapos ng pagkahimatay, pagkalito, o heat stroke. May epekto na puwedeng lumabas pagkatapos ng exposure.",
      },
      {
        title: "Tingnan muli ang opisyal na abiso bago bumalik sa gawain",
        detail:
          "I-check ang updated heat forecast at lokal na payo bago bumalik sa outdoor work, sports, o biyahe.",
      },
      {
        title: "I-report ang mali o lumang impormasyon",
        detail:
          "Kung mali o luma na ang detalye ng isang cooling place, gamitin ang report form sa page nito para masuri ng awtorisadong reviewer.",
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
    note: "Opisyal na heat-index categories at monitoring page ng PAGASA.",
  },
  {
    title: "Heat-Related Illnesses",
    publisher: "Department of Health — Cordillera Administrative Region",
    url: "https://caro.doh.gov.ph/heat-related-illnesses/",
    note: "Public-health guidance tungkol sa heat exhaustion, heat stroke, at prevention.",
  },
  {
    title: "Heat and health",
    publisher: "World Health Organization",
    url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health",
    note: "Pangkalahatang impormasyon tungkol sa init at mga panganib sa kalusugan.",
  },
  {
    title: "PAGASA iHeatMAP",
    publisher: "DOST-PAGASA",
    url: "https://src.panahon.gov.ph/pubfiles/cad/iaas/ihif_new.html",
    note: "Opisyal na interactive heat-index reference. Hindi awtomatikong kinukuha ng SILONG PH ang map na ito.",
  },
  {
    title: "National Disaster Risk Reduction and Management Council",
    publisher: "NDRRMC",
    url: "https://ndrrmc.gov.ph/",
    note: "Pambansang impormasyon sa disaster preparedness at response.",
  },
];

export const MEDICAL_DISCLAIMER =
  "Pangkalahatang heat-safety education ang SILONG PH, hindi medical advice o diagnosis. Kung pinaghihinalaang heat stroke o may emergency na delikado sa buhay, tumawag agad sa 911 o lokal na emergency service. Huwag ipagpaliban ang emergency care para gamitin ang app na ito.";
