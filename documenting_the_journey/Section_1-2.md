<style>body {text-align: justify}</style>

# Let's get the show on the road!
## Step 1: I need a MariaDB server on my local machine
Since my local home machine has issues with docker, and the server refuses to start, I won't loose any more time with it. I went to mariadb.com and downloaded the server, also installed a DBeaver and created a DB called "`auctionGame`".


## Step 2: DB setup 
So I need the following tables:
- users
  - id
  - username
  - password
  - apikey
  - bank_account_id
  - pocket_money
- auction_inventory
  - id
  - item_id
  - initial_value
- auction_items_on_display
  - id
  - item_id
  - original_owner_id
  - max_bidder
  - max_sum
- bank_accounts
  - id
  - amount
- items
  - id
  - name
  - description
  - attack_modifier
  - defense_modifier
  - magic_modifier
  - bonus_effect_1_id
  - bonus_effect_2_id
  - bonus_effect_3_id
  - price
- item_names_1
  - id
  - name
- item_names_2
  - id
  - name
- item_names_3
  - id
  - name
- item_descriptions
  - id
  - description
- bonus_effects 
  - id
  - effect name
  - effect description 
- user_inventory
  - id
  - user_id
  - item_id
  - amount_paid


**The Prompt:** 
> Give me the SQL CREATE queries for the following tables with the following fields: -> and I copy pasted the list above of table names and fields<-

  ### o4 answer
  - It gave me 11 separate scripts, 1 for each table.
  - Really liked it created foreign keys for the fields
  - Loved the fact that the "pocket_money" had a default value (even tho I will modify it to be 100)
  - The order of the tables in the answer was according to my input, so it was easy to follow.

<details>
  <summary>This was it's answer:</summary>

1. **users** Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    apikey VARCHAR(255),
    bank_account_id INT,
    pocket_money DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
); 
```

2. **auction_inventory** Table
```sql
CREATE TABLE auction_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    initial_value DECIMAL(10, 2) NOT NULL
);
```
3. **auction_items_on_display** Table
```sql
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
```
4. **bank_accounts** Table
```sql
CREATE TABLE bank_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    amount DECIMAL(15, 2) DEFAULT 0.00
);
```
5. **items** Table
```sql
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
```
6. **item_names_1** Table
```sql
CREATE TABLE item_names_1 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);
```
7. **i**tem_names_2** Table
```sql
CREATE TABLE item_names_2 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);
```
8. **item_names_3** Table
```sql
CREATE TABLE item_names_3 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);
```
9. **item_descriptions** Table
```sql
CREATE TABLE item_descriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description TEXT NOT NULL
);
```
10. **bonus_effects** Table
```sql
CREATE TABLE bonus_effects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    effect_name VARCHAR(255) NOT NULL,
    effect_description TEXT
);
```
11. **user_inventory** Table
```sql
CREATE TABLE user_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);
```
These SQL queries define tables with appropriate fields, data types, primary keys, foreign keys, and default values where necessary.
</details>

 ### o1-preview answer
- It gave me 1 script with all the create table instructions (liked this one more)
- The order of the tables was not in the same order as the input list 
- Foreign keys were generated as well
- Explanation on how the tables are connected through foreign keys
- Explanation on how the field types have been selected

<details>
<summary>Answer:</summary>

```SQL
-- Table: bank_accounts
CREATE TABLE bank_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL
);

-- Table: users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    apikey VARCHAR(255),
    bank_account_id INT,
    pocket_money DECIMAL(10,2),
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
);

-- Table: bonus_effects
CREATE TABLE bonus_effects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    effect_name VARCHAR(255),
    effect_description TEXT
);

-- Table: items
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    attack_modifier INT,
    defense_modifier INT,
    magic_modifier INT,
    bonus_effect_1_id INT,
    bonus_effect_2_id INT,
    bonus_effect_3_id INT,
    price DECIMAL(10,2),
    FOREIGN KEY (bonus_effect_1_id) REFERENCES bonus_effects(id),
    FOREIGN KEY (bonus_effect_2_id) REFERENCES bonus_effects(id),
    FOREIGN KEY (bonus_effect_3_id) REFERENCES bonus_effects(id)
);

-- Table: auction_inventory
CREATE TABLE auction_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    initial_value DECIMAL(10,2),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Table: auction_items_on_display
CREATE TABLE auction_items_on_display (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    original_owner_id INT,
    max_bidder INT,
    max_sum DECIMAL(10,2),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (original_owner_id) REFERENCES users(id),
    FOREIGN KEY (max_bidder) REFERENCES users(id)
);

-- Table: item_names_1
CREATE TABLE item_names_1 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

-- Table: item_names_2
CREATE TABLE item_names_2 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

-- Table: item_names_3
CREATE TABLE item_names_3 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

-- Table: item_descriptions
CREATE TABLE item_descriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT
);

-- Table: user_inventory
CREATE TABLE user_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    item_id INT,
    amount_paid DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);
```

Explanation:

Primary Keys: Each table has an id field set as the primary key with AUTO_INCREMENT for unique identification.

Foreign Keys:
- users.bank_account_id references bank_accounts(id).
- items.bonus_effect_1_id, bonus_effect_2_id, bonus_effect_3_id reference bonus_effects(id).
- auction_inventory.item_id references items(id).
- auction_items_on_display.item_id references items(id).
- auction_items_on_display.original_owner_id and max_bidder reference users(id).
- user_inventory.user_id references users(id).
- user_inventory.item_id references items(id).

Data Types:
- VARCHAR(255) for text fields like username, password, name, and effect_name.
- TEXT for longer text fields like description and effect_description.
- INT for numeric fields like attack_modifier, defense_modifier, magic_modifier, and foreign key references.
- DECIMAL(10,2) for monetary values like amount, pocket_money, initial_value, max_sum, and price.

Feel free to adjust data types and constraints based on your specific database requirements!

</details>