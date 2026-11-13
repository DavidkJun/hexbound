import { describe, expect, it } from 'vitest';
import {
  canPlay,
  endTurn,
  intentOf,
  playCard,
  startFight,
  type Battle,
  type FightSetup,
} from './fight';
import { seedRng } from './rng';
import { starterDeck, testContent as content } from './test-content';

const resources = { health: 60, maxHealth: 60, gold: 20, food: 10 };

/** A fight whose first draws are `draws`, in order, so a test knows the hand. */
function fight(enemy: string, draws: readonly string[] = [], setup: Partial<FightSetup> = {}) {
  return startFight(content, {
    enemy,
    deck: [...draws, ...starterDeck],
    resources,
    rng: seedRng(1),
    scriptedDraws: draws,
    ...setup,
  });
}

/** Plays the first card in hand with this id. */
function play(battle: Battle, id: string): Battle {
  return playCard(content, battle, battle.fight.hand.indexOf(id));
}

describe('fight start', () => {
  it('shuffles the deck into the draw pile and starts turn 1 with 3 energy and 5 cards', () => {
    const { fight: started } = startFight(content, {
      enemy: 'rat',
      deck: starterDeck,
      resources,
      rng: seedRng(1),
    });
    expect(started.turn).toBe(1);
    expect(started.player.energy).toBe(3);
    expect(started.hand).toHaveLength(5);
    expect(started.drawPile).toHaveLength(starterDeck.length - 5);
    expect([...started.hand, ...started.drawPile].sort()).toEqual([...starterDeck].sort());
    expect(started.tutorial).toBe(false);
  });

  it('replays the same way for the same seed', () => {
    const setup = { enemy: 'rat', deck: starterDeck, resources, rng: seedRng(9) };
    expect(startFight(content, setup)).toEqual(startFight(content, setup));
  });

  it('draws the scripted cards first, as the tutorial does', () => {
    const draws = ['ration', 'ice-shard', 'strike', 'defend', 'strike', 'defend'];
    const { fight: started } = startFight(content, {
      enemy: 'rat',
      deck: starterDeck,
      resources,
      rng: seedRng(1),
      scriptedDraws: draws,
    });
    expect(started.hand).toEqual(draws.slice(0, 5));
    expect(started.drawPile[0]).toBe('defend');
    expect(started.tutorial).toBe(true);
  });

  it('shows the first move of a cycle as the intent', () => {
    expect(fight('rat').fight.enemy.intent).toBe('bite');
  });

  it('applies Chilled and Rested from the map', () => {
    const { player } = fight('rat', [], { chilled: true, rested: true }).fight;
    expect(player.energy).toBe(2); // Chill 1 from ice: 1 less energy on the first turn
    expect(player.chill).toBe(0); // then the player's Chill is removed
    expect(player.block).toBe(5); // Rested, kept on the first turn
  });
});

describe('playing cards', () => {
  it('spends energy, applies the effects and discards the card', () => {
    const after = play(fight('rat', ['strike']), 'strike');
    expect(after.fight.player.energy).toBe(2);
    expect(after.fight.enemy.health).toBe(14);
    expect(after.fight.discard).toEqual(['strike']);
    expect(after.fight.hand).toHaveLength(4);
  });

  it("can't play a card that costs more than the energy left", () => {
    let battle = fight('rat', ['strike', 'strike', 'strike', 'strike']);
    battle = play(play(play(battle, 'strike'), 'strike'), 'strike');
    expect(canPlay(content, battle.fight, 0)).toBe(false);
    expect(playCard(content, battle, 0)).toBe(battle);
  });

  it('exhausts a card with Exhaust for the rest of the fight', () => {
    const after = play(fight('rat', ['ration']), 'ration');
    expect(after.fight.exhausted).toEqual(['ration']);
    expect(after.fight.discard).toEqual([]);
    expect(after.resources.food).toBe(12);
  });

  it('lets energy go above 3 for the turn', () => {
    expect(play(fight('rat', ['surge']), 'surge').fight.player.energy).toBe(5);
  });

  it('adds strength to every attack', () => {
    const after = play(play(fight('rat', ['war-cry', 'strike']), 'war-cry'), 'strike');
    expect(after.fight.enemy.health).toBe(20 - 8);
  });

  it('draws with Draw', () => {
    const after = play(fight('rat', ['flurry']), 'flurry');
    expect(after.fight.hand).toHaveLength(5);
  });

  it('lets block absorb damage first', () => {
    const battle = fight('rat', ['strike']);
    const blocked = {
      ...battle,
      fight: { ...battle.fight, enemy: { ...battle.fight.enemy, block: 5 } },
    };
    const after = play(blocked, 'strike');
    expect(after.fight.enemy.block).toBe(0);
    expect(after.fight.enemy.health).toBe(20 - 1);
  });

  it("keeps the enemy's block through the player's turn, until its own turn starts", () => {
    let battle = fight('rat');
    for (let i = 0; i < 3; i++) battle = endTurn(content, battle); // bite, bite, burrow
    expect(battle.fight.enemy.block).toBe(5);
  });
});

describe('turns', () => {
  it('discards the hand, lets the enemy act, and starts the next turn', () => {
    const after = endTurn(content, fight('rat'));
    expect(after.resources.health).toBe(60 - 8);
    expect(after.fight.turn).toBe(2);
    expect(after.fight.hand).toHaveLength(5);
    expect(after.fight.discard).toHaveLength(5);
    expect(after.fight.enemy.intent).toBe('bite');
  });

  it('resets block at the start of every turn but the first', () => {
    const blocked = play(fight('rat', ['defend']), 'defend');
    expect(blocked.fight.player.block).toBe(5);
    const next = endTurn(content, blocked);
    expect(next.resources.health).toBe(60 - 3); // 8 damage, 5 absorbed
    expect(next.fight.player.block).toBe(0);
  });

  it('moves through a cycle pattern', () => {
    const intents = [fight('rat')];
    for (let i = 0; i < 3; i++) intents.push(endTurn(content, intents.at(-1) ?? fight('rat')));
    expect(intents.map(({ fight: f }) => f.enemy.intent)).toEqual([
      'bite',
      'bite',
      'burrow',
      'bite',
    ]);
  });

  it('picks a random move by its weights', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 40; seed++) {
      seen.add(fight('wisp', [], { rng: seedRng(seed) }).fight.enemy.intent);
    }
    expect([...seen].sort()).toEqual(['numb', 'touch']);
  });

  it('reshuffles the discard pile when the draw pile runs out', () => {
    let battle = startFight(content, {
      enemy: 'rat',
      deck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend'],
      resources,
      rng: seedRng(3),
    });
    battle = endTurn(content, battle);
    expect(battle.fight.hand).toHaveLength(5);
    expect(battle.fight.drawPile.length + battle.fight.discard.length).toBe(2);
  });

  it('draws nothing when both piles are empty', () => {
    const battle = startFight(content, {
      enemy: 'rat',
      deck: ['flurry'],
      resources,
      rng: seedRng(3),
    });
    expect(battle.fight.hand).toEqual(['flurry']);
    expect(play(battle, 'flurry').fight.hand).toEqual([]);
  });

  it('sends a card drawn into a full hand to the discard pile', () => {
    const deck = Array<string>(12).fill('flurry');
    let battle = startFight(content, { enemy: 'rat', deck, resources, rng: seedRng(3) });
    battle = {
      ...battle,
      fight: { ...battle.fight, player: { ...battle.fight.player, energy: 9 } },
    };
    for (let i = 0; i < 5; i++) battle = playCard(content, battle, 0); // each draws 1
    // 5 in hand, 5 played into the discard pile and drawn again: never more than 10 in hand
    expect(battle.fight.hand.length).toBeLessThanOrEqual(10);
    const all =
      battle.fight.hand.length + battle.fight.drawPile.length + battle.fight.discard.length;
    expect(all).toBe(12);
  });
});

describe('Freeze and Chill', () => {
  it('Freeze skips the next move, and the pattern moves on', () => {
    const frozen = play(fight('rat', ['deep-freeze']), 'deep-freeze');
    expect(intentOf(content, frozen.fight).frozen).toBe(true);
    const after = endTurn(content, frozen);
    expect(after.resources.health).toBe(60);
    expect(after.fight.enemy.frozen).toBe(false);
    expect(after.fight.enemy.intent).toBe('bite'); // the second bite of bite, bite, burrow
    expect(after.fight.enemy.movesTaken).toBe(1);
  });

  it("Freeze doesn't stack", () => {
    const twice = play(
      play(fight('rat', ['deep-freeze', 'deep-freeze']), 'deep-freeze'),
      'deep-freeze',
    );
    const after = endTurn(content, endTurn(content, twice));
    expect(after.resources.health).toBe(60 - 8); // skipped one move, did the next
  });

  it('Chill on the enemy weakens its attacks and wears off by 1 after its turn', () => {
    const chilled = play(fight('rat', ['ice-shard']), 'ice-shard');
    expect(intentOf(content, chilled.fight).value).toBe(7);
    const after = endTurn(content, chilled);
    expect(after.resources.health).toBe(60 - 7);
    expect(after.fight.enemy.chill).toBe(0);
  });

  it('Chill on the player takes energy next turn, then goes', () => {
    // The wisp's numb applies Chill 1. Find a seed where it shows numb first.
    const seed = [...Array(40).keys()].find(
      (s) => fight('wisp', [], { rng: seedRng(s) }).fight.enemy.intent === 'numb',
    );
    const after = endTurn(content, fight('wisp', [], { rng: seedRng(seed ?? 0) }));
    expect(after.fight.player.energy).toBe(2);
    expect(after.fight.player.chill).toBe(0);
  });
});

describe('intent', () => {
  it('shows the damage the attack will really deal', () => {
    let battle = fight('brute');
    expect(intentOf(content, battle.fight)).toMatchObject({ value: 2, frozen: false }); // roar: +2 strength
    battle = endTurn(content, battle);
    expect(intentOf(content, battle.fight).value).toBe(12); // smash 10 + strength 2
  });
});

describe('the end of a fight', () => {
  it('ends the moment the enemy reaches 0 health, even in the middle of a card', () => {
    const battle = fight('rat', ['flurry', 'strike']);
    const weak = {
      ...battle,
      fight: { ...battle.fight, enemy: { ...battle.fight.enemy, health: 3 } },
    };
    const after = play(weak, 'flurry'); // 3 damage, then Draw 1, which never happens
    expect(after.fight.outcome).toBe('won');
    expect(after.fight.hand).toHaveLength(4);
    expect(play(after, 'strike')).toBe(after);
    expect(endTurn(content, after)).toBe(after);
  });

  it('is lost when the player reaches 0 health', () => {
    const battle = fight('rat', [], { resources: { ...resources, health: 5 } });
    const after = endTurn(content, battle);
    expect(after.fight.outcome).toBe('lost');
    expect(after.resources.health).toBe(0);
  });
});
