import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "public", "images", "valorant");
const rosterFile = path.join(rootDir, "src", "lib", "valorant-roster.ts");

await fs.mkdir(outputDir, { recursive: true });

async function downloadFile(url, destPath, retries = 5) {
  if (!url) {
    throw new Error(`Missing URL for ${destPath}`);
  }

  // Check if file already exists and is valid
  try {
    const stat = await fs.stat(destPath);
    if (stat.size > 1000) {
      console.log(`⚡ Existing valid file: ${path.basename(destPath)} (${(stat.size / 1024).toFixed(1)} KB) - skipping download.`);
      return stat.size;
    }
  } catch {
    // file does not exist, proceed
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Downloading (attempt ${attempt}/${retries}): ${url} -> ${path.basename(destPath)}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status} ${res.statusText}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 1000) {
        throw new Error(`File too small (${buffer.length} bytes)`);
      }
      await fs.writeFile(destPath, buffer);
      console.log(`✓ Saved ${path.basename(destPath)} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return buffer.length;
    } catch (err) {
      console.warn(`Attempt ${attempt} failed for ${path.basename(destPath)}: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

async function main() {
  console.log("=== STARTING VALORANT ASSETS FETCH ===");

  // 1. Fetch Agents
  console.log("\n[1/3] Fetching agents from valorant-api.com...");
  const agentsRes = await fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true");
  if (!agentsRes.ok) throw new Error("Failed to fetch agents list");
  const agentsJson = await agentsRes.json();
  const agentsData = agentsJson.data;

  const targetAgentNames = ["Jett", "Omen", "Phoenix"];
  const rosterData = [];

  for (const name of targetAgentNames) {
    const agent = agentsData.find(
      (a) => a.displayName.toLowerCase() === name.toLowerCase()
    );
    if (!agent) {
      throw new Error(`Agent ${name} not found in API response`);
    }

    const slug = name.toLowerCase();
    const portraitPath = path.join(outputDir, `agent-${slug}.png`);
    const iconPath = path.join(outputDir, `icon-${slug}.png`);
    const roleIconPath = path.join(outputDir, `role-${slug}.png`);

    await downloadFile(agent.fullPortrait, portraitPath);
    await downloadFile(agent.displayIcon, iconPath);
    await downloadFile(agent.role?.displayIcon, roleIconPath);

    // Abilities: Ability1, Ability2, Grenade, Ultimate
    // Sort or map abilities
    const slotOrder = ["Ability1", "Ability2", "Grenade", "Ultimate"];
    const slotKeyLetters = ["Q", "E", "C", "X"]; // Standard Valorant keybinds: Ability1 = Q, Ability2 = E, Grenade = C, Ultimate = X
    const abilities = [];

    // Filter valid abilities (some passive abilities have slot 'Passive')
    const agentAbilities = agent.abilities.filter((ab) => ab.displayIcon);

    for (let i = 0; i < slotOrder.length; i++) {
      const targetSlot = slotOrder[i];
      let ability = agentAbilities.find((ab) => ab.slot === targetSlot);
      if (!ability && agentAbilities[i]) {
        ability = agentAbilities[i];
      }

      if (ability && ability.displayIcon) {
        const skillIndex = i + 1;
        const skillFileName = `skill-${slug}-${skillIndex}.png`;
        const skillPath = path.join(outputDir, skillFileName);
        await downloadFile(ability.displayIcon, skillPath);

        abilities.push({
          slot: slotKeyLetters[i] || `Skill ${skillIndex}`,
          slotName: ability.slot || `Ability${skillIndex}`,
          name: ability.displayName,
          description: ability.description.trim(),
          icon: `/images/valorant/${skillFileName}`,
        });
      }
    }

    rosterData.push({
      slug,
      name: agent.displayName,
      role: agent.role?.displayName || "Duelist",
      roleDescription: agent.role?.description || "",
      roleIcon: `/images/valorant/role-${slug}.png`,
      portrait: `/images/valorant/agent-${slug}.png`,
      icon: `/images/valorant/icon-${slug}.png`,
      description: agent.description,
      abilities,
    });
  }

  // 2. Fetch Weapons
  console.log("\n[2/3] Fetching weapons from valorant-api.com...");
  const weaponsRes = await fetch("https://valorant-api.com/v1/weapons");
  if (!weaponsRes.ok) throw new Error("Failed to fetch weapons list");
  const weaponsJson = await weaponsRes.json();
  const weaponsData = weaponsJson.data;

  const vandal = weaponsData.find((w) => w.displayName.toLowerCase() === "vandal");
  if (!vandal) throw new Error("Vandal not found in weapons list");
  await downloadFile(vandal.displayIcon, path.join(outputDir, "weapon-vandal.png"));

  const melee = weaponsData.find((w) => w.displayName.toLowerCase() === "melee");
  if (!melee) throw new Error("Melee not found in weapons list");
  await downloadFile(melee.displayIcon, path.join(outputDir, "weapon-melee.png"));

  // 3. Fetch Maps
  console.log("\n[3/3] Fetching maps from valorant-api.com...");
  const mapsRes = await fetch("https://valorant-api.com/v1/maps");
  if (!mapsRes.ok) throw new Error("Failed to fetch maps list");
  const mapsJson = await mapsRes.json();
  const mapsData = mapsJson.data;

  const ascent = mapsData.find((m) => m.displayName.toLowerCase() === "ascent");
  if (!ascent) throw new Error("Ascent not found in maps list");
  await downloadFile(ascent.splash, path.join(outputDir, "map-ascent-splash.png"));
  await downloadFile(ascent.displayIcon, path.join(outputDir, "map-ascent-minimap.png"));

  // 4. Generate src/lib/valorant-roster.ts
  console.log("\n[4/4] Writing roster metadata to src/lib/valorant-roster.ts...");
  const tsContent = `// VALORANT Official Agent Roster & Asset Catalog
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

export const VALORANT_ROSTER: ValorantAgent[] = ${JSON.stringify(rosterData, null, 2)};

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
`;

  await fs.writeFile(rosterFile, tsContent, "utf8");
  console.log(`✓ Roster configuration written to ${rosterFile}`);
  console.log("\n=== ALL ASSETS SUCCESSFULLY FETCHED & VERIFIED ===");
}

main().catch((err) => {
  console.error("FATAL ERROR fetching assets:", err);
  process.exit(1);
});
