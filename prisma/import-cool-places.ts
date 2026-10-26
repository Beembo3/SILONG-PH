/**
 * Idempotent, insert-only import of source-verified Cool Places for Central Luzon.
 *
 * - Never updates, archives, truncates, or deletes existing records.
 * - Skips a candidate when a record with the same normalised name already exists in
 *   the same province, or when a similarly named record sits within ~350 m.
 * - Run with: npx tsx --env-file=.env prisma/import-cool-places.ts
 *   Add --dry-run to preview without writing.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

interface PlaceSeed {
  name: string;
  category: string;
  address: string;
  provinceCode: string;
  localityCode: string;
  latitude: number;
  longitude: number;
  operatingHours: string | null;
  amenities: string[];
  publicAccessDetails: string;
  verificationNote: string;
  sourceUrl: string;
}

const MALL_AMENITIES = [
  "Air-conditioned indoor space",
  "Public restroom",
  "Food outlets",
  "Seating areas",
];

const MALL_ACCESS =
  "Public mall open to general visitors during posted hours; entry is subject to mall policies. Not an official cooling centre.";

function mall(record: {
  name: string;
  address: string;
  provinceCode: string;
  localityCode: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  sourceUrl: string;
  operator: string;
  extraNote?: string;
}): PlaceSeed {
  return {
    name: record.name,
    category: "Shopping Malls",
    address: record.address,
    provinceCode: record.provinceCode,
    localityCode: record.localityCode,
    latitude: record.latitude,
    longitude: record.longitude,
    operatingHours: record.operatingHours,
    amenities: MALL_AMENITIES,
    publicAccessDetails: MALL_ACCESS,
    verificationNote:
      `Verified against the ${record.operator} official directory, which lists this branch, its address, and mall hours. ` +
      `Coordinates cross-checked against OpenStreetMap/Nominatim. Air-conditioning is a standard feature of these enclosed malls. ` +
      `Confirm holiday hours and current entry policies before travelling.` +
      (record.extraNote ? ` ${record.extraNote}` : ""),
    sourceUrl: record.sourceUrl,
  };
}

const records: PlaceSeed[] = [
  // ── BULACAN ────────────────────────────────────────────────────────────────
  mall({
    name: "SM City Marilao",
    address: "MacArthur Highway, Brgy. Ibayo, Marilao, Bulacan",
    provinceCode: "0301400000",
    localityCode: "0301411000",
    latitude: 14.754578,
    longitude: 120.9562387,
    operatingHours: "Mo-Su 10:00-21:00",
    sourceUrl: "https://www.smsupermalls.com/mall-directory/sm-city-marilao/information",
    operator: "SM Supermalls",
  }),
  mall({
    name: "SM City Baliwag",
    address: "DRT Highway, Brgy. Pagala, Baliuag, Bulacan",
    provinceCode: "0301400000",
    localityCode: "0301403000",
    latitude: 14.9606609,
    longitude: 120.8909046,
    operatingHours: "Mo-Su 10:00-21:00",
    sourceUrl: "https://www.smsupermalls.com/mall-directory/sm-city-baliwag/information",
    operator: "SM Supermalls",
  }),
  mall({
    name: "SM Center Pulilan",
    address: "Pulilan Diversion Road, Brgy. Sto. Cristo, Pulilan, Bulacan",
    provinceCode: "0301400000",
    localityCode: "0301418000",
    latitude: 14.8991079,
    longitude: 120.8690895,
    operatingHours: "Mo-Su 10:00-21:00",
    sourceUrl: "https://www.smsupermalls.com/mall-directory/sm-center-pulilan/information",
    operator: "SM Supermalls",
  }),
  mall({
    name: "Robinsons Malolos",
    address: "MacArthur Highway, Sumapang Matanda, Malolos City, Bulacan",
    provinceCode: "0301400000",
    localityCode: "0301410000",
    latitude: 14.8503449,
    longitude: 120.8239484,
    operatingHours: "Mo-Th 10:00-21:00; Fr-Su 10:00-22:00",
    sourceUrl: "https://robinsonsmalls.com/mall-info/robinsons-place-malolos",
    operator: "Robinsons Malls",
  }),
  mall({
    name: "WalterMart Sta. Maria",
    address: "G/F WalterMart Center, Provincial Road, Sta. Clara, Santa Maria, Bulacan",
    provinceCode: "0301400000",
    localityCode: "0301423000",
    latitude: 14.8223253,
    longitude: 120.9542261,
    operatingHours: "Mo-Su 09:00-21:00",
    sourceUrl: "https://www.waltermartdelivery.com.ph/stores/waltermart-sta-maria",
    operator: "WalterMart",
  }),
  mall({
    name: "WalterMart Guiguinto",
    address: "WalterMart Shopping Center Guiguinto, MacArthur Highway, Brgy. Ilang-Ilang, Guiguinto, Bulacan",
    provinceCode: "0301400000",
    localityCode: "0301408000",
    latitude: 14.8276013,
    longitude: 120.87389,
    operatingHours: "Mo-Su 09:00-21:00",
    sourceUrl: "https://www.waltermartdelivery.com.ph/stores/waltermart-guiguinto",
    operator: "WalterMart",
  }),
  mall({
    name: "WalterMart Plaridel",
    address: "WalterMart Shopping Center Plaridel, Cagayan Valley Road, Banga 1, Plaridel, Bulacan",
    provinceCode: "0301400000",
    localityCode: "0301417000",
    latitude: 14.8809231,
    longitude: 120.8665136,
    operatingHours: "Mo-Su 09:00-21:00",
    sourceUrl: "https://www.waltermartdelivery.com.ph/stores/waltermart-plaridel",
    operator: "WalterMart",
  }),
  mall({
    name: "Vista Mall Malolos",
    address: "MacArthur Highway, Brgy. Longos, Malolos City, Bulacan",
    provinceCode: "0301400000",
    localityCode: "0301410000",
    latitude: 14.8757582,
    longitude: 120.7972945,
    operatingHours: "Su-Th 10:00-20:00; Fr-Sa 10:00-21:00",
    sourceUrl: "https://www.vistamalls.com.ph/malls/malolos/",
    operator: "Vista Mall",
  }),

  // ── PAMPANGA ───────────────────────────────────────────────────────────────
  mall({
    name: "SM City San Fernando Downtown",
    address:
      "V. Tomico Street corner Consunji Street, Downtown Heritage District, Brgy. Sto. Rosario, City of San Fernando, Pampanga",
    provinceCode: "0305400000",
    localityCode: "0305416000",
    latitude: 15.0278096,
    longitude: 120.6923374,
    operatingHours: "Mo-Su 10:00-21:00",
    sourceUrl:
      "https://www.smsupermalls.com/mall-directory/sm-city-san-fernando-downtown/information",
    operator: "SM Supermalls",
  }),
  mall({
    name: "SM City Telabastagan",
    address: "MacArthur Highway, Brgy. Telabastagan, City of San Fernando, Pampanga",
    provinceCode: "0305400000",
    localityCode: "0305416000",
    latitude: 15.1209419,
    longitude: 120.6017192,
    operatingHours: "Mo-Su 10:00-21:00",
    sourceUrl: "https://www.smsupermalls.com/mall-directory/sm-city-telabastagan/information",
    operator: "SM Supermalls",
  }),
  mall({
    name: "Robinsons Starmills",
    address: "Brgy. San Jose, City of San Fernando, Pampanga",
    provinceCode: "0305400000",
    localityCode: "0305416000",
    latitude: 15.0486335,
    longitude: 120.698432,
    operatingHours: "Mo-Su 10:00-21:00",
    sourceUrl: "https://robinsonsmalls.com/mall-info/robinsons-starmills",
    operator: "Robinsons Malls",
  }),
  mall({
    name: "Robinsons Angeles",
    address: "MacArthur Highway, Balibago, Angeles City, Pampanga",
    provinceCode: "0305400000",
    localityCode: "0330100000",
    latitude: 15.1572466,
    longitude: 120.5915953,
    operatingHours: "Mo-Su 10:00-21:00",
    sourceUrl: "https://robinsonsmalls.com/mall-info/robinsons-angeles",
    operator: "Robinsons Malls",
  }),
  mall({
    name: "Ayala Malls MarQuee",
    address: "Nepomuceno Avenue, Pulung Maragul, Angeles City, Pampanga",
    provinceCode: "0305400000",
    localityCode: "0330100000",
    latitude: 15.1637006,
    longitude: 120.6102006,
    operatingHours: "Mo-Fr 11:00-21:00; Sa-Su 10:00-22:00",
    sourceUrl: "https://www.ayalamalls.com/main/malls/ayala-marquee",
    operator: "Ayala Malls",
    extraNote:
      "Ayala Malls lists 11 AM–9 PM on weekdays and 10 AM–10 PM on weekends; the mall's Facebook page has advertised 10 AM–9 PM daily, so confirm same-day hours.",
  }),
  mall({
    name: "Vista Mall Pampanga",
    address: "MacArthur Highway, Brgy. San Agustin, City of San Fernando, Pampanga",
    provinceCode: "0305400000",
    localityCode: "0305416000",
    latitude: 15.0492329,
    longitude: 120.6643756,
    operatingHours: "Mo-Su 10:00-21:00",
    sourceUrl: "https://www.vistamalls.com.ph/malls/pampanga/",
    operator: "Vista Mall",
  }),
  mall({
    name: "WalterMart San Fernando",
    address: "2/F WalterMart Center, MacArthur Highway, San Agustin, City of San Fernando, Pampanga",
    provinceCode: "0305400000",
    localityCode: "0305416000",
    latitude: 15.0479736,
    longitude: 120.6657307,
    operatingHours: "Mo-Su 09:00-21:00",
    sourceUrl: "https://www.waltermartdelivery.com.ph/stores/waltermart-san-fernando",
    operator: "WalterMart",
  }),

  // ── NUEVA ECIJA ────────────────────────────────────────────────────────────
  mall({
    name: "SM Megacenter Cabanatuan",
    address:
      "Between Melencio Street and Gen. Tinio Street, Brgy. San Roque Norte, Cabanatuan City, Nueva Ecija",
    provinceCode: "0304900000",
    localityCode: "0304903000",
    latitude: 15.4878088,
    longitude: 120.9678987,
    operatingHours: "Mo-Su 10:00-21:00",
    sourceUrl: "https://www.smsupermalls.com/mall-directory/sm-megacenter-cabanatuan/information",
    operator: "SM Supermalls",
  }),
  mall({
    name: "Robinsons Gapan",
    address: "Pan-Philippine Highway, Gapan City, Nueva Ecija",
    provinceCode: "0304900000",
    localityCode: "0304908000",
    latitude: 15.3008883,
    longitude: 120.9485542,
    operatingHours: "Mo-Su 10:00-21:00",
    sourceUrl: "https://robinsonsmalls.com/node/916",
    operator: "Robinsons Malls",
    extraNote:
      "The official mall page lists hours but not the full street address; the Pan-Philippine Highway location is also reported by GMA News.",
  }),
  mall({
    name: "WalterMart Cabanatuan",
    address:
      "Ground Floor, WalterMart Center, Maharlika Highway, Dicarma (Poblacion), Cabanatuan City, Nueva Ecija",
    provinceCode: "0304900000",
    localityCode: "0304903000",
    latitude: 15.4865829,
    longitude: 120.9718912,
    operatingHours: "Mo-Su 09:00-21:00",
    sourceUrl: "https://www.waltermartdelivery.com.ph/stores/waltermart-cabanatuan",
    operator: "WalterMart",
  }),
  mall({
    name: "WalterMart San Jose",
    address:
      "WalterMart San Jose, Maharlika Pan-Philippine Highway, Brgy. Malasin, San Jose City, Nueva Ecija",
    provinceCode: "0304900000",
    localityCode: "0304926000",
    latitude: 15.7977778,
    longitude: 120.9937167,
    operatingHours: "Mo-Su 09:00-20:00",
    sourceUrl: "https://www.waltermartdelivery.com.ph/stores/waltermart-san-jose",
    operator: "WalterMart",
  }),

  // ── TARLAC ─────────────────────────────────────────────────────────────────
  mall({
    name: "Robinsons Luisita",
    address: "MacArthur Highway, Brgy. San Miguel, Hacienda Luisita, Tarlac City, Tarlac",
    provinceCode: "0306900000",
    localityCode: "0306916000",
    latitude: 15.4312153,
    longitude: 120.5992032,
    operatingHours: "Mo-Su 10:00-21:00",
    sourceUrl: "https://robinsonsmalls.com/mall-info/robinsons-luisita",
    operator: "Robinsons Malls",
  }),
  mall({
    name: "WalterMart Paniqui",
    address: "WalterMart Paniqui, R-9, Paniqui, Tarlac",
    provinceCode: "0306900000",
    localityCode: "0306910000",
    latitude: 15.6678286,
    longitude: 120.5858373,
    operatingHours: "Mo-Su 09:00-20:00",
    sourceUrl: "https://www.waltermartdelivery.com.ph/stores/waltermart-paniqui",
    operator: "WalterMart",
  }),

  // ── ZAMBALES / OLONGAPO ────────────────────────────────────────────────────
  mall({
    name: "SM City Olongapo Central",
    address: "Rizal Avenue, Brgy. East Tapinac, Olongapo City",
    provinceCode: "0307100000",
    localityCode: "0331400000",
    latitude: 14.8363313,
    longitude: 120.2828655,
    operatingHours: "Mo-Su 10:00-21:00",
    sourceUrl: "https://www.smsupermalls.com/mall-directory/sm-city-olongapo-central/information",
    operator: "SM Supermalls",
    extraNote:
      "Street address taken from the mall's Wikipedia entry, which matches the OSM mall node; confirm entrance details on site.",
  }),
  mall({
    name: "Ayala Malls Harbor Point",
    address: "Rizal Avenue, Subic Bay Freeport Zone, Olongapo City",
    provinceCode: "0307100000",
    localityCode: "0331400000",
    latitude: 14.8250508,
    longitude: 120.2803244,
    operatingHours: "Su-Th 10:00-21:00; Fr-Sa 10:00-22:00",
    sourceUrl: "https://www.ayalamalls.com/main/malls/ayala-harbor-point",
    operator: "Ayala Malls",
    extraNote:
      "Address and hours are from the Ayala Malls page; the mall's Instagram has advertised 10 AM–9 PM daily, so confirm same-day hours.",
  }),
  mall({
    name: "WalterMart Subic",
    address: "WalterMart Subic, Zambales-Pangasinan Road, Brgy. Mangan-Vaca, Subic, Zambales",
    provinceCode: "0307100000",
    localityCode: "0307114000",
    latitude: 14.8885016,
    longitude: 120.2365779,
    operatingHours: "Mo-Su 09:00-20:00",
    sourceUrl: "https://www.waltermartdelivery.com.ph/stores/waltermart-subic",
    operator: "WalterMart",
  }),

  // ── BATAAN ─────────────────────────────────────────────────────────────────
  mall({
    name: "Vista Mall Bataan",
    address: "Roman Superhighway, Brgy. Cupang Proper, Balanga City, Bataan",
    provinceCode: "0300800000",
    localityCode: "0300803000",
    latitude: 14.6547135,
    longitude: 120.5333873,
    operatingHours: "Mo-Su 10:00-20:00",
    sourceUrl: "https://www.vistamalls.com.ph/malls/bataan/",
    operator: "Vista Mall",
    extraNote:
      "Coordinates resolved from the official Vista Mall Bataan map link; OSM's mall node is within ~30 m.",
  }),
  mall({
    name: "WalterMart Balanga",
    address:
      "Ground Floor, WalterMart Balanga, Roman Superhighway, Brgy. Tenejero, Balanga City, Bataan",
    provinceCode: "0300800000",
    localityCode: "0300803000",
    latitude: 14.6714724,
    longitude: 120.5230916,
    operatingHours: "Mo-Su 09:00-20:00",
    sourceUrl: "https://www.waltermartdelivery.com.ph/stores/waltermart-balanga",
    operator: "WalterMart",
  }),

  // ── AURORA — parks, nature, museum ─────────────────────────────────────────
  {
    name: "Quezon Memorial Park",
    category: "Public park",
    address: "Quezon Street, Poblacion, Baler, Aurora",
    provinceCode: "0307700000",
    localityCode: "0307701000",
    latitude: 15.7599211,
    longitude: 121.5617407,
    operatingHours: null,
    amenities: ["Shaded areas", "Benches", "Tables"],
    publicAccessDetails:
      "Public town park and plaza open to visitors. No entrance fee is published; confirm current park rules with the Baler municipal government.",
    verificationNote:
      "Verified via the Aurora provincial tourism page for Quezon Park, which describes a public plaza with shady trees, benches, and tables, and via the Baler municipal government's tourist-spot listing. Coordinates from the OSM park node. Operating hours are not published online.",
    sourceUrl: "https://www.aurora.ph/quezon-park/",
  },
  {
    name: "Ermita Hill",
    category: "Public park",
    address: "Sitio Dicaloyungan, Brgy. Zabali, Baler, Aurora",
    provinceCode: "0307700000",
    localityCode: "0307701000",
    latitude: 15.7546025,
    longitude: 121.5805804,
    operatingHours: null,
    amenities: ["Viewpoint", "Trekking trails", "Camping area", "Shaded areas"],
    publicAccessDetails:
      "Public hill and trail open to visitors. No entrance fee is published; confirm trail conditions and any camping rules with the Baler municipal government.",
    verificationNote:
      "Verified via the Aurora provincial tourism page for Ermita Hill, which describes a public two-hectare plateau used for trekking and camping, and via the Baler municipal tourist-spot listing. Coordinates from the OSM park node. Hours and fees are not published online.",
    sourceUrl: "https://www.aurora.ph/ermita-hill/",
  },
  {
    name: "Ditumabo Mother Falls",
    category: "Waterfall",
    address: "Brgy. Ditumabo, San Luis, Aurora",
    provinceCode: "0307700000",
    localityCode: "0307708000",
    latitude: 15.6753164,
    longitude: 121.47869,
    operatingHours: null,
    amenities: ["Forest trail", "Waterfall", "Swimming area", "Shaded areas"],
    publicAccessDetails:
      "Public ecotourism site. A local guide is required and entrance/guide fees apply per the San Luis tourism office's 2026 advisory; confirm current rates and hours before travelling.",
    verificationNote:
      "Verified via the Aurora provincial tourism page for Ditumabo Falls (Brgy. Ditumabo, San Luis; 30–45-minute forest trek to a swimming basin). The San Luis tourism office's October 2026 public advisory lists an entrance fee and guide fee and states the falls have reopened. Coordinates from the OSM waterfall node. Hours are not published on a stable page.",
    sourceUrl: "https://www.aurora.ph/ditumabo-mother-falls-mother-falls/",
  },
  {
    name: "Museo de Baler",
    category: "Public museum",
    address: "Quezon and T. Molina Streets, Brgy. Poblacion, Baler, Aurora",
    provinceCode: "0307700000",
    localityCode: "0307701000",
    latitude: 15.7601092,
    longitude: 121.561766,
    operatingHours: "Mo-Su 09:00-17:00",
    amenities: ["Indoor museum", "Exhibits"],
    publicAccessDetails:
      "Public component museum of the National Museum of the Philippines. Admission is free; open daily 9 AM–5 PM; closed on officially declared holidays.",
    verificationNote:
      "Verified via the National Museum of the Philippines announcement of its 22nd component museum in Baler (opened 30 June 2026; free admission; daily 9 AM–5 PM from 1 July 2026) and the Aurora tourism page for the museum's address. Air-conditioning is not stated in the source, so the record describes indoor museum space rather than claiming air-conditioning.",
    sourceUrl:
      "https://www.nationalmuseum.gov.ph/2026/06/30/nmp-opens-22nd-component-museum-in-baler-aurora/",
  },

  // ── BATAAN — parks ─────────────────────────────────────────────────────────
  {
    name: "Balanga City Wetland and Nature Park",
    category: "Nature park",
    address: "Brgy. Tortugas, Balanga City, Bataan",
    provinceCode: "0300800000",
    localityCode: "0300803000",
    latitude: 14.6916923,
    longitude: 120.5601467,
    operatingHours: null,
    amenities: ["Outdoor nature area", "Birdwatching", "Shaded areas"],
    publicAccessDetails:
      "Public city nature park open to visitors. Operating hours and any fees are not published on the city page; confirm with the Balanga City Tourism Office before travelling.",
    verificationNote:
      "Verified via the City of Balanga official page, which lists the park under Public Places at Brgy. Tortugas and describes it as an outdoor recreational museum for birds and shore species. Coordinates are at Brgy. Tortugas level from OSM; the exact entrance within the barangay was not published, so treat the marker as approximate.",
    sourceUrl: "https://cityofbalanga.gov.ph/experiencebalanga/wetland-and-nature-park/",
  },
  {
    name: "Bataan Tourism Park",
    category: "Public park",
    address: "Bataan Tourism Center compound, Roman Superhighway, Balanga City, Bataan",
    provinceCode: "0300800000",
    localityCode: "0300803000",
    latitude: 14.6782565,
    longitude: 120.5191807,
    operatingHours: "Mo-Su 05:00-21:00",
    amenities: ["Benches", "Picnic areas", "Fish pond", "Open lawn"],
    publicAccessDetails:
      "Public park open daily 5 AM–9 PM with free entry. It is a day-use park; confirm any event-day closures with the Bataan Provincial Tourism Office.",
    verificationNote:
      "Verified via the Bataan Provincial Tourism Office's Behold Bataan article confirming the park reopened on 16 September 2026, the 1Bataan report on the park's opening at the Bataan Tourism Center compound, and the tourism office's Facebook post stating daily 5 AM–9 PM public hours. Coordinates from the OSM Bataan Tourism Center node.",
    sourceUrl: "https://beholdbataan.ph/bataan-tourism-park-is-now-open/",
  },

  // ── BULACAN — national park ────────────────────────────────────────────────
  {
    name: "Biak-na-Bato National Park",
    category: "National park",
    address: "Brgy. Biak-na-Bato, San Miguel, Bulacan",
    provinceCode: "0301400000",
    localityCode: "0301421000",
    latitude: 15.118879,
    longitude: 121.085081,
    operatingHours: "Mo-Su 08:00-17:00",
    amenities: ["Caves", "Forest trails", "River", "Picnic areas"],
    publicAccessDetails:
      "Public national park open daily 8 AM–5 PM according to the park's official page. Entrance fees may apply; confirm current fees and cave-access rules at the gate.",
    verificationNote:
      "Verified via the park's official Facebook page, which states the park is open daily 8 AM–5 PM (post effective 5 January 2026), and Wikipedia/PAIS for national-park status and location in Brgy. Biak-na-Bato, San Miguel, Bulacan. Coordinates from Wikipedia's park coordinates. Some secondary conservation profiles list the site's conservation-project status as closed; the official park page is the current visitor-access source.",
    sourceUrl: "https://www.facebook.com/BNBNPBulacan/",
  },

  // ── NUEVA ECIJA — national park ────────────────────────────────────────────
  {
    name: "Minalungao National Park",
    category: "National park",
    address: "General Tinio, Nueva Ecija",
    provinceCode: "0304900000",
    localityCode: "0304910000",
    latitude: 15.2989285,
    longitude: 121.122909,
    operatingHours: null,
    amenities: ["River", "Rock formations", "Picnic areas", "Swimming area"],
    publicAccessDetails:
      "Public national park and provincial ecotourism destination. The park's official page says it is open daily; entrance fees and exact hours are not published online, so confirm with the General Tinio tourism office.",
    verificationNote:
      "Verified via the Nueva Ecija provincial government's Minalungao National Park page, which describes the protected river gorge and its picnic, swimming, fishing, rafting, and cliff-diving facilities, and via the park's official Facebook page stating it is open daily (7 February 2026 post). Coordinates from the OSM park node.",
    sourceUrl: "https://www.nuevaecija.ph/destinations/minalungao-national-park/",
  },

  // ── PAMPANGA — public park ─────────────────────────────────────────────────
  {
    name: "Air Force City Park",
    category: "Public park",
    address: "Andres Bonifacio Avenue, Clark Freeport Zone, Mabalacat City, Pampanga",
    provinceCode: "0305400000",
    localityCode: "0305409000",
    latitude: 15.1745633,
    longitude: 120.5413851,
    operatingHours: null,
    amenities: ["Aircraft displays", "Shaded areas", "Open lawn"],
    publicAccessDetails:
      "Public park in the Clark Freeport Zone open to visitors. No entrance fee is published; confirm current hours and any event-day restrictions with the Clark Development Corporation or the park operator.",
    verificationNote:
      "Verified via the Hann Resorts/Visit Clark attraction page, which describes Air Force City as a family-friendly public park with retired Philippine Air Force aircraft on display, at Andres Bonifacio Avenue, Clark Freeport Zone. Coordinates from the OSM park node. Hours are not published online.",
    sourceUrl: "https://www.hannresorts.com/plan-your-visit/air-force-city/",
  },

  // ── TARLAC — sports and recreation park ────────────────────────────────────
  {
    name: "Tarlac Recreational Park",
    category: "Sports and recreation park",
    address: "Sports Complex Drive, San Jose, Tarlac",
    provinceCode: "0306900000",
    localityCode: "0306918000",
    latitude: 15.4996716,
    longitude: 120.5016843,
    operatingHours: "Mo-Su 08:00-17:00",
    amenities: ["Sports facilities", "Swimming pool", "Camping area", "Picnic areas"],
    publicAccessDetails:
      "Public provincial sports and recreation park (Jose V. Yap Sports and Recreational Complex). Open daily; the admin office is listed as 8 AM–5 PM. Some facilities may charge fees; confirm with park staff.",
    verificationNote:
      "Verified via the park's official Facebook page for the Jose V. Yap Sports and Recreational Complex, which lists the park as public, open daily, with an admin office from 8 AM–5 PM, and via the Tarlac provincial government's budget documents naming the complex in San Jose. Coordinates from the OSM park node. Grounds hours may extend beyond office hours.",
    sourceUrl: "https://www.facebook.com/tarlacrecreationalpark/",
  },
];

function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function main() {
  const admin = await prisma.user.findFirst({
    where: { email: "admin@silong.local" },
    select: { id: true, email: true },
  });
  if (!admin) throw new Error("Admin account admin@silong.local not found");

  const existing = await prisma.coolingPlace.findMany({
    where: { archivedAt: null },
    select: {
      id: true,
      name: true,
      provinceCode: true,
      latitude: true,
      longitude: true,
    },
  });

  const known = existing.map((row) => ({
    id: row.id,
    name: row.name,
    normalisedName: normalise(row.name),
    provinceCode: row.provinceCode,
    latitude: row.latitude,
    longitude: row.longitude,
  }));

  let inserted = 0;
  let skipped = 0;

  for (const record of records) {
    const normalisedName = normalise(record.name);
    const duplicate = known.find((row) => {
      if (row.provinceCode !== record.provinceCode) return false;
      if (row.normalisedName === normalisedName) return true;
      const near = distanceKm(
        row.latitude,
        row.longitude,
        record.latitude,
        record.longitude,
      );
      const namesOverlap =
        row.normalisedName.includes(normalisedName) ||
        normalisedName.includes(row.normalisedName);
      return near < 0.35 && namesOverlap;
    });

    if (duplicate) {
      skipped += 1;
      console.log(`SKIP  ${record.name} — matches existing "${duplicate.name}" (${duplicate.id})`);
      continue;
    }

    if (dryRun) {
      inserted += 1;
      console.log(`DRY   ${record.name} | ${record.provinceCode}/${record.localityCode} | ${record.category}`);
      continue;
    }

    const created = await prisma.coolingPlace.create({
      data: {
        name: record.name,
        category: record.category,
        address: record.address,
        provinceCode: record.provinceCode,
        localityCode: record.localityCode,
        latitude: record.latitude,
        longitude: record.longitude,
        operatingHours: record.operatingHours,
        amenities: JSON.stringify(record.amenities),
        publicAccessDetails: record.publicAccessDetails,
        verificationStatus: "VERIFIED",
        verificationNote: record.verificationNote,
        sourceUrl: record.sourceUrl,
        createdById: admin.id,
        verifiedById: admin.id,
        verifiedAt: new Date(),
        lastReviewedAt: new Date(),
      },
      select: { id: true, name: true },
    });

    inserted += 1;
    known.push({
      id: created.id,
      name: created.name,
      normalisedName,
      provinceCode: record.provinceCode,
      latitude: record.latitude,
      longitude: record.longitude,
    });
    console.log(`ADD   ${created.name} | ${record.provinceCode}/${record.localityCode} | ${record.category}`);
  }

  console.log(
    `\n${dryRun ? "DRY RUN" : "IMPORT"}: ${inserted} ${dryRun ? "would be added" : "added"}, ${skipped} skipped as duplicates, ${records.length} candidates total.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
