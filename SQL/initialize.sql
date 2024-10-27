

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    apikey VARCHAR(255),
    bank_account_id INT,
    pocket_money DECIMAL(10, 2) DEFAULT 100.00,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
);


CREATE TABLE auction_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    initial_value DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
											  
);



CREATE TABLE auction_items_on_display (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    original_owner_id INT NOT NULL,
    max_bidder INT,
    max_sum DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (original_owner_id) REFERENCES users(id),
    FOREIGN KEY (max_bidder) REFERENCES users(id)
);


CREATE TABLE bank_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    amount DECIMAL(15, 2) DEFAULT 0.00 NOT NULL
);


CREATE TABLE items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    attack_modifier INT DEFAULT 0,
    defense_modifier INT DEFAULT 0,
    magic_modifier INT DEFAULT 0,
    bonus_effect_1_id INT,
    bonus_effect_2_id INT,
    bonus_effect_3_id INT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (bonus_effect_1_id) REFERENCES bonus_effects(id),
    FOREIGN KEY (bonus_effect_2_id) REFERENCES bonus_effects(id),
    FOREIGN KEY (bonus_effect_3_id) REFERENCES bonus_effects(id)
);


CREATE TABLE item_names_1 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);


CREATE TABLE item_names_2 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);


CREATE TABLE item_names_3 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);


CREATE TABLE item_descriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description TEXT NOT NULL
);


CREATE TABLE bonus_effects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    effect_name VARCHAR(255) NOT NULL,
    effect_description TEXT
);


CREATE TABLE user_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);


---------------- INSERTS:
INSERT INTO item_names_1 (name) VALUES
('Ancient'),
('Arcane'),
('Blood'),
('Celestial'),
('Crimson'),
('Crystal'),
('Cursed'),
('Dark'),
('Demon'),
('Divine'),
('Dragon'),
('Dragons'),
('Dwarven'),
('Elven'),
('Emerald'),
('Enchanted'),
('Flaming'),
('Frost'),
('Ghostly'),
('Golden'),
('Holy'),
('Infernal'),
('Legendary'),
('Moonlit'),
('Mystic'),
('Obsidian'),
('Orcish'),
('Phantom'),
('Phoenix'),
('Radiant'),
('Royal'),
('Sacred'),
('Serpent'),
('Shadow'),
('Silver'),
('Storm'),
('Thunder'),
('Titan'),
('Void');

INSERT INTO item_names_2 (name) VALUES
('Amulet'),
('Armor'),
('Axe'),
('Belt'),
('Blade'),
('Boots'),
('Bow'),
('Cloak'),
('Crossbow'),
('Crown'),
('Dagger'),
('Gauntlet'),
('Gauntlets'),
('Greaves'),
('Hammer'),
('Helm'),
('Lance'),
('Lantern'),
('Mace'),
('Necklace'),
('Orb'),
('Pendant'),
('Ring'),
('Robe'),
('Rod'),
('Scepter'),
('Scythe'),
('Shield'),
('Spear'),
('Staff'),
('Sword'),
('Tome'),
('Wand');

INSERT INTO item_names_3 (name) VALUES
('of Courage'),
('of Crystal Clarity'),
('of Dark Omens'),
('of Demonic Fury'),
('of Destiny'),
('of Divine Judgement'),
('of Doom'),
('of Dragonfire'),
('of Elven Grace'),
('of Eternal Light'),
('of Eternal Night'),
('of Flames'),
('of Forgotten Kings'),
('of Fortune'),
('of Ghostly Echoes'),
('of Glory'),
('of Honor'),
('of Ice'),
('of Light'),
('of Magic'),
('of Power'),
('of Shadows'),
('of Stealth'),
('of Strength'),
('of Thunderstorms'),
('of Titans Wrath'),
('of Vengeance'),
('of Wisdom'),
('of the Abyss'),
('of the Ancients'),
('of the Arcane'),
('of the Bear'),
('of the Dragon'),
('of the Eagle'),
('of the Emerald Dawn'),
('of the Forest'),
('of the Frozen Wastes'),
('of the Inferno'),
('of the Maelstrom'),
('of the Moon'),
('of the Night'),
('of the Phantom Realm'),
('of the Phoenix'),
('of the Sea'),
('of the Serpents Eye'),
('of the Sun'),
('of the Undead'),
('of the Wolf');

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

INSERT INTO bonus_effects (effect_name, effect_description) VALUES
('Bloodthirst', 'Restores health with each attack.'),
('Critical Strike', 'Increases chance of critical hits.'),
('Crystal Clarity', 'Improves focus, increasing accuracy.'),
('Curse Removal', 'Removes curses and negative effects.'),
('Curse of Weakness', 'Reduces enemy strength when hit.'),
('Dark Omen', 'Increases critical hit chance at night.'),
('Demonic Rage', 'Boosts strength when low on health.'),
('Divine Protection', 'Reduces damage from all sources.'),
('Dragons Roar', 'Increases fire damage.'),
('Earthquake', 'Chance to stun enemies with ground tremors.'),
('Elven Grace', 'Improves stealth and evasion.'),
('Emerald Regeneration', 'Gradually restores health over time.'),
('Fire Resistance', 'Reduces fire damage taken by 50%.'),
('Fireball Spell', 'Enables casting a powerful fireball.'),
('Flame Aura', 'Adds fire damage to attacks.'),
('Flight', 'Grants the ability to fly for short periods.'),
('Frost Shield', 'Reduces damage from ice-based attacks.'),
('Ghostly Presence', 'Reduces enemy accuracy in combat.'),
('Golden Fortune', 'Increases the amount of gold found.'),
('Healing Aura', 'Gradually restores health over time.'),
('Ice Shield', 'Grants an ice barrier that absorbs damage.'),
('Judgement of the Gods', 'Greatly enhances damage against undead.'),
('Kings Blessing', 'Boosts defense and charisma.'),
('Lifesteal', 'Converts a portion of damage dealt into health.'),
('Lightning Strike', 'Adds lightning damage to attacks.'),
('Lunar Power', 'Increases magic during nighttime.'),
('Magic Resistance', 'Reduces magical damage taken by 30%.'),
('Mana Regeneration', 'Speeds up mana recovery rate.'),
('Mind Control', 'Briefly control an enemys actions.'),
('Mystic Power', 'Increases magic damage.'),
('Night Vision', 'Enables clear vision in the dark.'),
('Phantom Strike', 'Increases damage while invisible.'),
('Phoenix Rebirth', 'Revives the wearer upon death once per day.'),
('Poison Touch', 'Attacks have a chance to poison the enemy.'),
('Serpents Bite', 'Adds poison damage to attacks.'),
('Shadow Step', 'Increases agility and evasion.'),
('Speed Increase', 'Boosts movement speed by 15%.'),
('Spirit Link', 'Shares damage with a bonded ally.'),
('Stamina Boost', 'Increases stamina by 25%.'),
('Stealth Mode', 'Renders the user invisible to enemies.'),
('Storm Fury', 'Increases attack speed in stormy conditions.'),
('Strength Boost', 'Increases physical strength by 20%.'),
('Teleportation', 'Instantly move to a known location.'),
('Thunderstrike', 'Unleashes a burst of lightning with each hit.'),
('Time Slow', 'Slows down time around the user.'),
('Titan Strength', 'Increases physical damage significantly.'),
('Voidwalker', 'Grants the ability to phase through objects temporarily.'),
('Water Breathing', 'Allows breathing underwater indefinitely.');

