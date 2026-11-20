// VALORANT Official Agent Roster & Asset Catalog
// Auto-generated via scripts/fetch-valorant-assets.mjs

export interface ValorantAbility {
  slot: string;
  slotName: string;
  name: string;
  description: string;
  icon: string;
}

export interface ValorantAgent {
  slug: "jett" | "omen" | "phoenix";
  name: string;
  role: string;
  roleDescription: string;
  roleIcon: string;
  portrait: string;
  icon: string;
  description: string;
  abilities: ValorantAbility[];
}

export const VALORANT_ROSTER: ValorantAgent[] = [
  {
    "slug": "jett",
    "name": "Jett",
    "role": "Duelist",
    "roleDescription": "Duelists are self-sufficient fraggers who their team expects, through abilities and skills, to get high frags and seek out engagements first.",
    "roleIcon": "/images/valorant/role-jett.png",
    "portrait": "/images/valorant/agent-jett.png",
    "icon": "/images/valorant/icon-jett.png",
    "description": "Representing her home country of South Korea, Jett's agile and evasive fighting style lets her take risks no one else can. She runs circles around every skirmish, cutting enemies up before they even know what hit them.",
    "abilities": [
      {
        "slot": "Q",
        "slotName": "Ability1",
        "name": "Updraft",
        "description": "Melompat tinggi ke udara secara instan untuk mencapai posisi strategis atau menghindari serangan musuh.",
        "icon": "/images/valorant/skill-jett-1.png"
      },
      {
        "slot": "E",
        "slotName": "Ability2",
        "name": "Tailwind",
        "description": "Melesat cepat ke arah pergerakan. Durasi dan efek reset otomatis setelah mendapatkan dua eliminasi.",
        "icon": "/images/valorant/skill-jett-2.png"
      },
      {
        "slot": "C",
        "slotName": "Grenade",
        "name": "Cloudburst",
        "description": "Melempar proyektil awan yang meledak menjadi asap tebal untuk menghalangi pandangan musuh dalam waktu singkat.",
        "icon": "/images/valorant/skill-jett-3.png"
      },
      {
        "slot": "X",
        "slotName": "Ultimate",
        "name": "Blade Storm",
        "description": "Mempersenjatai diri dengan lima belati presisi mematikan. Mengeliminasi musuh akan mengisi ulang seluruh belati.",
        "icon": "/images/valorant/skill-jett-4.png"
      }
    ]
  },
  {
    "slug": "omen",
    "name": "Omen",
    "role": "Controller",
    "roleDescription": "Controllers are experts in slicing up dangerous territory to set their team up for success.",
    "roleIcon": "/images/valorant/role-omen.png",
    "portrait": "/images/valorant/agent-omen.png",
    "icon": "/images/valorant/icon-omen.png",
    "description": "A phantom of a memory, Omen hunts in the shadows. He renders enemies blind, teleports across the field, then lets paranoia take hold as his foe scrambles to uncover where he might strike next.",
    "abilities": [
      {
        "slot": "Q",
        "slotName": "Ability1",
        "name": "Paranoia",
        "description": "Menembakkan proyektil bayangan penembus dinding yang membutakan dan menulikan musuh seketika.",
        "icon": "/images/valorant/skill-omen-1.png"
      },
      {
        "slot": "E",
        "slotName": "Ability2",
        "name": "Dark Cover",
        "description": "Mengirimkan bola asap bayangan jarak jauh yang tahan lama untuk memblokir pandangan musuh secara taktis.",
        "icon": "/images/valorant/skill-omen-2.png"
      },
      {
        "slot": "C",
        "slotName": "Grenade",
        "name": "Shrouded Step",
        "description": "Melakukan teleportasi jarak pendek ke lokasi target yang dipilih setelah jeda pemusatan singkat.",
        "icon": "/images/valorant/skill-omen-3.png"
      },
      {
        "slot": "X",
        "slotName": "Ultimate",
        "name": "From the Shadows",
        "description": "Memilih titik mana pun di peta untuk melakukan teleportasi global secara instan.",
        "icon": "/images/valorant/skill-omen-4.png"
      }
    ]
  },
  {
    "slug": "phoenix",
    "name": "Phoenix",
    "role": "Duelist",
    "roleDescription": "Duelists are self-sufficient fraggers who their team expects, through abilities and skills, to get high frags and seek out engagements first.",
    "roleIcon": "/images/valorant/role-phoenix.png",
    "portrait": "/images/valorant/agent-phoenix.png",
    "icon": "/images/valorant/icon-phoenix.png",
    "description": "Hailing from the U.K., Phoenix's star power shines through in his fighting style, igniting the battlefield with flash and flare. Whether he's got backup or not, he's rushing in to fight on his own terms.",
    "abilities": [
      {
        "slot": "Q",
        "slotName": "Ability1",
        "name": "Hot Hands",
        "description": "Melempar bola api yang meledak di tanah, membakar musuh sekaligus memulihkan HP Phoenix saat berada di atasnya.",
        "icon": "/images/valorant/skill-phoenix-1.png"
      },
      {
        "slot": "E",
        "slotName": "Ability2",
        "name": "Curveball",
        "description": "Melempar kilatan cahaya melengkung di sudut ruangan yang menyilaukan musuh seketika.",
        "icon": "/images/valorant/skill-phoenix-2.png"
      },
      {
        "slot": "C",
        "slotName": "Grenade",
        "name": "Blaze",
        "description": "Menciptakan dinding api pelindung yang menghalangi pandangan, merusak lawan, dan memulihkan HP Phoenix.",
        "icon": "/images/valorant/skill-phoenix-3.png"
      },
      {
        "slot": "X",
        "slotName": "Ultimate",
        "name": "Run it Back",
        "description": "Menandai posisi awal. Jika gugur selama durasi aktif, Phoenix otomatis terlahir kembali di titik awal dengan HP penuh.",
        "icon": "/images/valorant/skill-phoenix-4.png"
      }
    ]
  }
];

export const VALORANT_WEAPONS = {
  vandal: {
    name: "Vandal",
    type: "Rifle",
    icon: "/images/valorant/weapon-vandal.png",
  },
  melee: {
    name: "Tactical Knife",
    type: "Melee",
    icon: "/images/valorant/weapon-melee.png",
  },
} as const;

export const VALORANT_MAP_ASCENT = {
  name: "Ascent",
  location: "Venice, Italy (Venue: Ruang Yudistira SMAN 1 Bantul)",
  splash: "/images/valorant/map-ascent-splash.png",
  minimap: "/images/valorant/map-ascent-minimap.png",
} as const;
