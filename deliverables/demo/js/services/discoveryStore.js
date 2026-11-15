// Local MVP scientific history; never persist grounded Google output or secrets.
const KEY = "paf-geological-history-v1";
import { scientificSnapshot } from "./analysisSnapshot.js";
export function loadDiscoveries() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
      .filter(
        ({ saved, result: r }) =>
          Date.now() - saved < 7 * 86400000 &&
          typeof r?.id === "string" &&
          r.localidade &&
          r.topography?.metrics &&
          r.comparisons &&
          r.pin &&
          r.explanation &&
          r.sources &&
          r.warnings,
      )
      .slice(-12)
      .map((x) => x.result);
  } catch {
    return [];
  }
}
export function saveDiscoveries(results) {
  const latest = new Map();
  for (const result of results) {
    if (!result.discovery_pin?.eligible && !result.pin?.eligible) continue;
    const key = result.discovery_pin?.id || result.pin.stable_id || result.id;
    // Grounding output/links/suggestions are displayed only in the live session.
    const snapshot = scientificSnapshot(result);
    latest.set(key, {
      saved: Date.now(),
      result: {
        ...snapshot,
        discovery: {
          ...snapshot.discovery,
          status: "history",
          message:
            "Histórico científico local; pesquisa Google não é armazenada. Execute nova análise para pesquisar novamente.",
        },
      },
    });
  }
  try {
    localStorage.setItem(KEY, JSON.stringify([...latest.values()].slice(-12)));
    return true;
  } catch {
    return false;
  }
}
