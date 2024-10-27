<style>body {text-align: justify}</style>

# Step 3: Some seed data for the static tables 
I am reffering here to tables "item_names_*" item descriptions and bonus_effects.

Let's ask ChatGpt to help us with some inserts for each of them.

## My Prompt:
```
I need a list of 25 inserts for each of the following tables: item_names_1, item_names_2, item_names_3, item_descriptions, bonus_effects

take into account that the name of a generated item will have to be under the form "element from
item_names_1" + " " + "element from item_names_2" + "  " + "element from item_names_3"

make the sugestions so they make sense

this is a fantasy world 
```

Both models answered with usable inserts, I will combine the unique elements and add them to the initialize SQL.

<details>
    <summary>o1-preview answer</summary>

```SQL
-- Table: item_names_1
INSERT INTO item_names_1 (name) VALUES
('Ancient'),
('Enchanted'),
('Mystic'),
('Shadow'),
('Radiant'),
('Infernal'),
('Celestial'),
('Cursed'),
('Sacred'),
('Royal'),
('Legendary'),
('Dragons'),
('Silver'),
('Golden'),
('Emerald'),
('Crimson'),
('Obsidian'),
('Phantom'),
('Storm'),
('Frost'),
('Flaming'),
('Dwarven'),
('Elven'),
('Orcish'),
('Arcane');

-- Table: item_names_2
INSERT INTO item_names_2 (name) VALUES
('Sword'),
('Shield'),
('Bow'),
('Staff'),
('Helm'),
('Armor'),
('Ring'),
('Amulet'),
('Dagger'),
('Axe'),
('Hammer'),
('Spear'),
('Cloak'),
('Boots'),
('Gauntlets'),
('Belt'),
('Necklace'),
('Robe'),
('Wand'),
('Tome'),
('Blade'),
('Crossbow'),
('Mace'),
('Lantern'),
('Orb');

-- Table: item_names_3
INSERT INTO item_names_3 (name) VALUES
('of Power'),
('of the Dragon'),
('of Wisdom'),
('of Shadows'),
('of Light'),
('of Flames'),
('of Ice'),
('of the Bear'),
('of the Phoenix'),
('of the Wolf'),
('of the Eagle'),
('of Strength'),
('of Courage'),
('of Stealth'),
('of Magic'),
('of the Sea'),
('of the Forest'),
('of the Night'),
('of Destiny'),
('of Doom'),
('of Fortune'),
('of Glory'),
('of Honor'),
('of Vengeance'),
('of the Ancients');

-- Table: item_descriptions
INSERT INTO item_descriptions (description) VALUES
('A relic from a bygone era, imbued with ancient power.'),
('Forged in the flames of a dying star, it radiates immense energy.'),
('Once wielded by a legendary hero in the great war.'),
('Crafted by dwarven smiths deep within the mountains.'),
('An elven artifact that glows with a mystical light.'),
('A cursed object that brings misfortune to its bearer.'),
('Said to have been blessed by the gods themselves.'),
('Stolen from the hoard of a fearsome dragon.'),
('An heirloom passed down through royal generations.'),
('Discovered in the ruins of an ancient civilization.'),
('Whispers secrets to those who listen closely.'),
('Emanates a cold aura that chills the air around it.'),
('Surrounded by a fiery glow that burns those unworthy.'),
('Grants the wearer unparalleled strength and courage.'),
('Allows the bearer to move unseen in the shadows.'),
('Contains the wisdom of ages long past.'),
('A key to unlocking forbidden knowledge.'),
('Shimmers with the colors of the aurora.'),
('Hums softly when danger is near.'),
('Guides lost souls back to the light.'),
('Enhances the magical abilities of its owner.'),
('Protects against the dark forces that lurk in the night.'),
('Said to bring good fortune to those who possess it.'),
('Feeds on the fears of your enemies.'),
('Holds the essence of a fallen star.');

-- Table: bonus_effects
INSERT INTO bonus_effects (effect_name, effect_description) VALUES
('Fire Resistance', 'Reduces fire damage taken by 50%.'),
('Ice Shield', 'Grants an ice barrier that absorbs damage.'),
('Shadow Step', 'Allows teleportation over short distances.'),
('Healing Aura', 'Gradually restores health over time.'),
('Strength Boost', 'Increases physical strength by 20%.'),
('Mana Regeneration', 'Speeds up mana recovery rate.'),
('Poison Touch', 'Attacks have a chance to poison the enemy.'),
('Speed Increase', 'Boosts movement speed by 15%.'),
('Critical Strike', 'Increases chance of critical hits.'),
('Lifesteal', 'Converts a portion of damage dealt into health.'),
('Magic Resistance', 'Reduces magical damage taken by 30%.'),
('Stealth Mode', 'Renders the user invisible to enemies.'),
('Stamina Boost', 'Increases stamina by 25%.'),
('Lightning Strike', 'Adds lightning damage to attacks.'),
('Earthquake', 'Chance to stun enemies with ground tremors.'),
('Water Breathing', 'Allows breathing underwater indefinitely.'),
('Night Vision', 'Enables clear vision in the dark.'),
('Flight', 'Grants the ability to fly for short periods.'),
('Curse Removal', 'Removes curses and negative effects.'),
('Spirit Link', 'Shares damage with a bonded ally.'),
('Fireball Spell', 'Enables casting a powerful fireball.'),
('Teleportation', 'Instantly move to a known location.'),
('Mind Control', 'Briefly control an enemy’s actions.'),
('Time Slow', 'Slows down time around the user.'),
('Divine Protection', 'Negates the next fatal damage received.');
```
</details>

<details>
    <summary>o4 answer</summary>

```SQL
INSERT INTO item_names_1 (name) VALUES
('Flaming'),
('Frost'),
('Shadow'),
('Thunder'),
('Holy'),
('Cursed'),
('Mystic'),
('Blood'),
('Storm'),
('Ancient'),
('Void'),
('Emerald'),
('Golden'),
('Moonlit'),
('Demon'),
('Dragon'),
('Elven'),
('Dark'),
('Phantom'),
('Titan'),
('Crystal'),
('Serpent'),
('Phoenix'),
('Ghostly'),
('Divine');

INSERT INTO item_names_2 (name) VALUES
('Blade'),
('Staff'),
('Bow'),
('Armor'),
('Shield'),
('Helm'),
('Ring'),
('Amulet'),
('Dagger'),
('Axe'),
('Hammer'),
('Gauntlet'),
('Greaves'),
('Spear'),
('Scepter'),
('Tome'),
('Orb'),
('Cloak'),
('Boots'),
('Pendant'),
('Crown'),
('Lance'),
('Scythe'),
('Sword'),
('Rod');

INSERT INTO item_names_3 (name) VALUES
('of the Inferno'),
('of the Frozen Wastes'),
('of Shadows'),
('of Thunderstorms'),
('of the Sun'),
('of the Undead'),
('of the Arcane'),
('of Eternal Night'),
('of the Maelstrom'),
('of Forgotten Kings'),
('of the Abyss'),
('of the Emerald Dawn'),
('of Eternal Light'),
('of the Moon'),
('of Demonic Fury'),
('of Dragonfire'),
('of Elven Grace'),
('of Dark Omens'),
('of the Phantom Realm'),
('of Titan’s Wrath'),
('of Crystal Clarity'),
('of the Serpent’s Eye'),
('of the Phoenix'),
('of Ghostly Echoes'),
('of Divine Judgement');

INSERT INTO item_descriptions (description) VALUES
('A weapon forged in ancient flames, it burns all it touches.'),
('This staff channels the cold power of the frozen tundra.'),
('An ethereal bow that fires arrows of pure shadow.'),
('Armor imbued with the fury of thunderstorms, crackling with energy.'),
('A shield blessed by the light of the sun, protecting its wielder from darkness.'),
('A cursed helm that whispers dark secrets to its wearer.'),
('A ring that grants mastery over the arcane arts.'),
('An amulet of untold power, once worn by the night itself.'),
('A dagger infused with the fury of a storm, fast and deadly.'),
('An axe forged in the heart of a volcano, its edge sears the air.'),
('A hammer that strikes with the force of a thousand mountains.'),
('Gauntlets that grant the wearer incredible strength and speed.'),
('Greaves that allow the wearer to move like the wind.'),
('A spear that hums with the energy of the storm.'),
('A scepter that holds the knowledge of ancient sorcerers.'),
('A tome filled with forbidden spells of incredible power.'),
('An orb that reveals the future to those who know how to read it.'),
('A cloak that renders the wearer invisible under moonlight.'),
('Boots that allow the wearer to walk on air.'),
('A pendant that radiates with divine energy, offering protection.'),
('A crown that once belonged to the ruler of a forgotten kingdom.'),
('A lance that glows with the fire of an ancient dragon.'),
('A scythe that steals the souls of those it touches.'),
('A sword that burns with holy fire, purging evil.'),
('A rod that crackles with arcane energy, amplifying the user’s magic.');

INSERT INTO bonus_effects (effect_name, effect_description) VALUES
('Flame Aura', 'Adds fire damage to attacks.'),
('Frost Shield', 'Reduces damage from ice-based attacks.'),
('Shadow Step', 'Increases agility and evasion.'),
('Thunderstrike', 'Unleashes a burst of lightning with each hit.'),
('Divine Protection', 'Reduces damage from all sources.'),
('Curse of Weakness', 'Reduces enemy strength when hit.'),
('Mystic Power', 'Increases magic damage.'),
('Bloodthirst', 'Restores health with each attack.'),
('Storm Fury', 'Increases attack speed in stormy conditions.'),
('King’s Blessing', 'Boosts defense and charisma.'),
('Voidwalker', 'Grants the ability to phase through objects temporarily.'),
('Emerald Regeneration', 'Gradually restores health over time.'),
('Golden Fortune', 'Increases the amount of gold found.'),
('Lunar Power', 'Increases magic during nighttime.'),
('Demonic Rage', 'Boosts strength when low on health.'),
('Dragon’s Roar', 'Increases fire damage.'),
('Elven Grace', 'Improves stealth and evasion.'),
('Dark Omen', 'Increases critical hit chance at night.'),
('Phantom Strike', 'Increases damage while invisible.'),
('Titan Strength', 'Increases physical damage significantly.'),
('Crystal Clarity', 'Improves focus, increasing accuracy.'),
('Serpent’s Bite', 'Adds poison damage to attacks.'),
('Phoenix Rebirth', 'Revives the wearer upon death once per day.'),
('Ghostly Presence', 'Reduces enemy accuracy in combat.'),
('Judgement of the Gods', 'Greatly enhances damage against undead.');

```
</details>

I decided to use both of them. But I did not want any duplicates, so I opened a new chatGpt window and i gave him the lists for each insert, and told him `here is a list, mentain only the unique elements:` and then realized that it was dificult for me to verify if they are unique or not, so for cosequent requests i asked him to `do the same for and order them alphabetically:`. Then it was enough to give the list and say `do the same for:`.