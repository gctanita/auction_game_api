const express = require('express');
const { v4: uuidv4 } = require('uuid'); // to generate UUID
const mysql = require('mysql2/promise'); // assuming you're using mysql2 with promises

// Create Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// data to connect to DB
const DB_CONNECTION_DATA = {
    host: 'localhost',
    user: 'root',
    password: 'parolamea',
    database: 'auctionGame'
};

const MODIFIER_ARRAY = [5, 4, 4, 3, 3, 3, 3,
    2, 2, 2, 2, 2, 2, 2, 2,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


async function createNewUser(dbConnection, username, password) {
    try {
        // Start a transaction
        await dbConnection.beginTransaction();

        // Step 1: Insert into bank_accounts with amount 0
        const [bankResult] = await dbConnection.execute(
            'INSERT INTO bank_accounts (amount) VALUES (?)',
            [0]
        );
        
        // Get the id of the newly inserted bank account
        const bankAccountId = bankResult.insertId;

        // Step 2: Generate a UUID for the apikey
        const apiKeyValue = uuidv4();

        // Step 3: Insert into users table
        const pocketMoney = 100; // set default pocket money
        const [userResult] = await dbConnection.execute(
            'INSERT INTO users '+
            '(username, password, apikey, bank_account_id, pocket_money) ' +
            'VALUES (?, ?, ?, ?, ?)',
            [username, password, apiKeyValue, bankAccountId, pocketMoney]
        );

        // Commit the transaction
        await dbConnection.commit();

        console.log(`${new Date().toISOString()} - INFO -  User "${username}" with id ${userResult.insertId} created successfully.`);
        
        return {
            userName: username,
            userId: userResult.insertId,
            apiKey: apiKeyValue,
            bankAccountId: bankAccountId
        };

    } catch (error) {
        // Rollback the transaction in case of error
        await dbConnection.rollback();
        console.error('Error creating user:', error);
        throw error;
    }
}

async function generateRandomItem(dbConnection) {
    try {
        // Start a transaction
        await dbConnection.beginTransaction();
        
        // Fetch random name components from the database
        const [name1] = await dbConnection.query('SELECT name FROM item_names_1 ORDER BY RAND() LIMIT 1');
        const [name2] = await dbConnection.query('SELECT name FROM item_names_2 ORDER BY RAND() LIMIT 1');
        const [name3] = await dbConnection.query('SELECT name FROM item_names_3 ORDER BY RAND() LIMIT 1');

        const itemName = `${name1[0].name} ${name2[0].name} ${name3[0].name}`;

         // Fetch random description from the database
         const [description] = await dbConnection.query('SELECT description FROM item_descriptions ORDER BY RAND() LIMIT 1');

        // Select random modifiers
        const attackModifier = MODIFIER_ARRAY[Math.floor(Math.random() * MODIFIER_ARRAY.length)];
        const defenseModifier = MODIFIER_ARRAY[Math.floor(Math.random() * MODIFIER_ARRAY.length)];
        const magicModifier = MODIFIER_ARRAY[Math.floor(Math.random() * MODIFIER_ARRAY.length)];

        // Determine rarity and bonus effects
        const rarityRoll = Math.random() * 100;
        let bonusCount = 0;
        let bonusEffect1 = null;
        let bonusEffect2 = null;
        let bonusEffect3 = null;

        if (rarityRoll < 5) {
            // Legendary (5% chance)
            bonusCount = 3;
        } else if (rarityRoll < 15) {
            // Unique (10% chance)
            bonusCount = 2;
        } else if (rarityRoll < 30) {
            // Rare (15% chance)
            bonusCount = 1;
        } else {
            // Normal (70% chance)
            bonusCount = 0;
        }

        // If the item has bonus effects, fetch them randomly from the database
        if (bonusCount > 0) {
            const [bonusEffect1Result] = await dbConnection.query('SELECT * FROM bonus_effects ORDER BY RAND() LIMIT 1');
            bonusEffect1 = bonusEffect1Result[0];

            if (bonusCount > 1) {
                const [bonusEffect2Result] = await dbConnection.query('SELECT * FROM bonus_effects ORDER BY RAND() LIMIT 1');
                bonusEffect2 = bonusEffect2Result[0];
            }

            if (bonusCount > 2) {
                const [bonusEffect3Result] = await dbConnection.query('SELECT * FROM bonus_effects ORDER BY RAND() LIMIT 1');
                bonusEffect3 = bonusEffect3Result[0];
            }
        }

        // Calculate the price
        const basePrice = (attackModifier + defenseModifier + magicModifier) * 10;
        const price = basePrice + Math.pow(10, bonusCount);

        // Insert the item into the 'items' table
        const [insertResult] = await dbConnection.execute(
            `INSERT INTO items 
            (name, description, attack_modifier, defense_modifier, magic_modifier, bonus_effect_1_id, bonus_effect_2_id, bonus_effect_3_id, price, owner_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                itemName,
                description[0].description,
                attackModifier,
                defenseModifier,
                magicModifier,
                (bonusEffect1 === null) ? null : bonusEffect1.id,
                (bonusEffect2 === null) ? null : bonusEffect2.id,
                (bonusEffect3 === null) ? null : bonusEffect3.id,
                price,
                0
            ]
        );

        // Commit the transaction
        await dbConnection.commit();

         // Construct the item object
         const item = {
            id: insertResult.insertId,
            name: itemName,
            description: description[0].description,
            attack_modifier: attackModifier,
            defense_modifier: defenseModifier,
            magic_modifier: magicModifier,
            bonus_effect_1_id: bonusEffect1,
            bonus_effect_2_id: bonusEffect2,
            bonus_effect_3_id: bonusEffect3,
            price: price,
            owner: 0
        };

        console.log(`${new Date().toISOString()} - INFO -  Item "${item.name}" with id ${item.id} was generated.`);
        return item;
    } catch (error) {
        console.error('Error generating item:', error);
        throw error;
    }
}

app.post('/create_user', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        (async () => {
            const dbConnection = await mysql.createConnection(DB_CONNECTION_DATA);

            try {
                const result = await createNewUser(dbConnection, username, password);

                res.status(201).json({
                    message: 'User created successfully.',
                    userId: result.userId,
                    userName: result.userName,
                    apiKey: result.apiKey,
                    bankAccountId: result.bankAccountId
                });

            } finally {
                await dbConnection.end();
            }
        })();
    
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating user.' });
    }
});

// Test ITEM GENERATION
(async () => {
    const dbConnection = await mysql.createConnection(DB_CONNECTION_DATA);

    try {
        const result = await generateRandomItem(dbConnection);

        console.log(result);

    } finally {
         await dbConnection.end();
    }
})();

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});