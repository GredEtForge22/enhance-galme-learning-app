import { heads, variantsOf, words } from "@/data/galme";
import { norm } from "./text";

export type GalmeAnswerMatch = "dictionary" | "variant" | null;

export const ENDING_HINT =
  "Quand un mot se termine par une voyelle, tu peux remplacer uniquement cette voyelle finale par a, e, i, o ou u pour l’harmonie de la phrase. Le reste du mot doit rester identique. Cette règle ne modifie jamais les affixes pre-, fu-, ve-, -sha, -ko et -vo, ni les expressions à tiret. Une forme qui correspond à un autre mot du dictionnaire n’est pas considérée comme une simple variante.";

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/**
 * Normalise un mot tout en conservant les tirets,
 * contrairement à norm() qui les supprime.
 */
function tokenForm(value: string): string {
  return value
    .toLowerCase()
    .replace(/й/g, "n")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

function lexicalTokens(value: string): string[] {
  return value
    .trim()
    .split(/\s+/)
    .map(tokenForm)
    .filter(Boolean);
}

/**
 * Associe chaque forme connue à son entrée du dictionnaire.
 * Cela inclut les formes principales et les variantes déclarées.
 */
const FORM_OWNERS = new Map<string, Set<number>>();

for (const entry of words) {
  const forms = new Set([
    ...heads(entry.g),
    ...variantsOf(entry),
  ]);

  for (const form of forms) {
    const parts = lexicalTokens(form);

    // Les expressions composées ne sont pas utilisées
    // comme collision d'un mot unique.
    if (parts.length !== 1) continue;

    const token = parts[0];
    const owners = FORM_OWNERS.get(token) ?? new Set<number>();

    owners.add(entry.id);
    FORM_OWNERS.set(token, owners);
  }
}

function sameDictionaryEntry(a: string, b: string): boolean {
  const ownersA = FORM_OWNERS.get(a);
  const ownersB = FORM_OWNERS.get(b);

  if (!ownersA || !ownersB) return false;

  for (const id of ownersA) {
    if (ownersB.has(id)) return true;
  }

  return false;
}

type ParsedToken = {
  base: string;
  prefixes: string[];
  suffixes: string[];
  blocked: boolean;
};

/**
 * Sépare les affixes reconnus de la racine.
 *
 * Les autres mots contenant un tiret, comme sali-vuro,
 * sont considérés comme des expressions lexicales bloquées.
 */
function parseAffixedToken(token: string): ParsedToken {
  // Un élément du dictionnaire qui contient déjà un tiret
  // est une expression ou un affixe autonome.
  if (token.includes("-") && FORM_OWNERS.has(token)) {
    return {
      base: token,
      prefixes: [],
      suffixes: [],
      blocked: true,
    };
  }

  let base = token;
  const prefixes: string[] = [];
  const suffixes: string[] = [];

  for (let guard = 0; guard < 4; guard++) {
    const match = base.match(/^(pre|fu|ve)-(.+)$/);

    if (!match) break;

    prefixes.push(match[1]);
    base = match[2];
  }

  for (let guard = 0; guard < 4; guard++) {
    const match = base.match(/^(.+)-(sha|ko|vo)$/);

    if (!match) break;

    suffixes.unshift(match[2]);
    base = match[1];
  }

  return {
    base,
    prefixes,
    suffixes,
    blocked: base.length === 0 || base.includes("-"),
  };
}

function sameList(a: string[], b: string[]): boolean {
  return (
    a.length === b.length &&
    a.every((value, index) => value === b[index])
  );
}

/**
 * Vérifie la nouvelle règle automatique :
 * seule la dernière lettre change, de voyelle à voyelle.
 */
function isAutomaticEndingVariant(
  expected: string,
  actual: string,
): boolean {
  if (
    expected.length === 0 ||
    expected.length !== actual.length ||
    expected === actual
  ) {
    return false;
  }

  const expectedLast = expected.at(-1)!;
  const actualLast = actual.at(-1)!;

  if (
    !VOWELS.has(expectedLast) ||
    !VOWELS.has(actualLast)
  ) {
    return false;
  }

  if (expected.slice(0, -1) !== actual.slice(0, -1)) {
    return false;
  }

  /*
   * Si la forme obtenue existe déjà dans le dictionnaire,
   * elle ne doit pas être acceptée comme variante automatique.
   *
   * Les variantes déclarées de la même entrée ont déjà été
   * acceptées par sameDictionaryEntry().
   */
  if (FORM_OWNERS.has(actual)) {
    return false;
  }

  return true;
}

function equivalentToken(
  expected: string,
  actual: string,
): boolean {
  if (expected === actual) return true;

  // Variantes explicitement déclarées dans le dictionnaire.
  if (sameDictionaryEntry(expected, actual)) {
    return true;
  }

  const expectedToken = parseAffixedToken(expected);
  const actualToken = parseAffixedToken(actual);

  // Les expressions à tiret non reconnues restent exactes.
  if (expectedToken.blocked || actualToken.blocked) {
    return false;
  }

  // Les affixes doivent être strictement identiques.
  if (
    !sameList(expectedToken.prefixes, actualToken.prefixes) ||
    !sameList(expectedToken.suffixes, actualToken.suffixes)
  ) {
    return false;
  }

  if (expectedToken.base === actualToken.base) {
    return true;
  }

  /*
   * Les variantes déjà déclarées restent valables,
   * y compris lorsqu'un affixe est présent.
   */
  if (
    sameDictionaryEntry(
      expectedToken.base,
      actualToken.base,
    )
  ) {
    return true;
  }

  /*
   * Avec un suffixe, la dernière lettre appartient à l'affixe.
   * On ne permet donc pas la variante automatique.
   *
   * Exemple refusé :
   * amora-ko -> amora-ka
   */
  if (expectedToken.suffixes.length > 0) {
    return false;
  }

  /*
   * Avec un préfixe, la fin du mot reste celle de la racine.
   *
   * Exemple accepté :
   * pre-daroke -> pre-daroka
   */
  return isAutomaticEndingVariant(
    expectedToken.base,
    actualToken.base,
  );
}

function equivalentSentence(
  expected: string,
  actual: string,
): boolean {
  const expectedTokens = lexicalTokens(expected);
  const actualTokens = lexicalTokens(actual);

  if (expectedTokens.length !== actualTokens.length) {
    return false;
  }

  return expectedTokens.every((token, index) =>
    equivalentToken(token, actualTokens[index]),
  );
}

/**
 * Vérifie une réponse libre.
 *
 * "dictionary" : forme principale du dictionnaire/corpus
 * "variant"    : variante déclarée ou terminaison autorisée
 * null         : réponse fausse
 */
export function matchGalmeAnswer(
  input: string,
  answers: readonly string[],
): GalmeAnswerMatch {
  if (!input.trim()) return null;

  const normalizedInput = norm(input);

  if (!normalizedInput) return null;

  // Vérification exacte avec le comportement déjà présent.
  for (let index = 0; index < answers.length; index++) {
    if (norm(answers[index]) === normalizedInput) {
      return index === 0 ? "dictionary" : "variant";
    }
  }

  // Vérification mot par mot des terminaisons.
  for (const answer of answers) {
    if (equivalentSentence(answer, input)) {
      return "variant";
    }
  }

  return null;
}
