import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ARRAYS_AND_STRINGS_PATTERNS,
  PATTERNS_BY_TOPIC,
  getPatternsForTopic,
} from "../data/patternCards";

describe("Pattern Cheat Sheets - Catalog Registry & Contracts", () => {
  it("provides exactly 4 core pattern cards for Arrays & Strings", () => {
    assert.equal(ARRAYS_AND_STRINGS_PATTERNS.length, 4);
    const patternIds = ARRAYS_AND_STRINGS_PATTERNS.map((p) => p.id);
    assert.deepEqual(patternIds, [
      "sliding-window",
      "two-pointers",
      "prefix-sums",
      "kadanes-algorithm",
    ]);
  });

  it("ensures each pattern card contains mandatory educational properties", () => {
    for (const card of ARRAYS_AND_STRINGS_PATTERNS) {
      assert.ok(card.id && card.id.length > 0, "Card must have an ID");
      assert.ok(card.name && card.name.length > 0, "Card must have a name");
      assert.ok(card.category && card.category.length > 0, "Card must have a category");
      assert.ok(card.description && card.description.length > 0, "Card must have a description");
      assert.ok(card.whenToUse && card.whenToUse.length > 0, "Card must have whenToUse items");
      assert.ok(card.keyInvariant && card.keyInvariant.length > 0, "Card must have keyInvariant");
      assert.ok(card.timeComplexity && card.timeComplexity.length > 0, "Card must have timeComplexity");
      assert.ok(card.spaceComplexity && card.spaceComplexity.length > 0, "Card must have spaceComplexity");
      assert.ok(card.commonPitfalls && card.commonPitfalls.length > 0, "Card must have commonPitfalls");
      assert.ok(card.codeTemplate && card.codeTemplate.includes("def "), "Card must have Python codeTemplate");
      assert.ok(card.visualCue && card.visualCue.length > 0, "Card must have visualCue");
    }
  });

  it("retrieves pattern cards via getPatternsForTopic registry", () => {
    const topic1Cards = getPatternsForTopic("arrays-and-strings");
    assert.equal(topic1Cards.length, 4);
    assert.equal(topic1Cards[0].id, "sliding-window");

    const unknownCards = getPatternsForTopic("dynamic-programming");
    assert.deepEqual(unknownCards, []);

    const nullCards = getPatternsForTopic(null);
    assert.deepEqual(nullCards, []);

    const undefinedCards = getPatternsForTopic(undefined);
    assert.deepEqual(undefinedCards, []);
  });

  it("maps registered topics correctly in PATTERNS_BY_TOPIC", () => {
    assert.ok("arrays-and-strings" in PATTERNS_BY_TOPIC);
    assert.equal(
      PATTERNS_BY_TOPIC["arrays-and-strings"],
      ARRAYS_AND_STRINGS_PATTERNS
    );
  });
});
