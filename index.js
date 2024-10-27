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

async function getItemsByApiKey(dbConnection, apiKey) {
    try {
        // Step 1: Fetch the user by the provided API key
        const [userResult] = await dbConnection.execute(
            'SELECT id FROM users WHERE apikey = ? LIMIT 1', [apiKey]
        );

        if (userResult.length === 0) {
            return { success: false, message: 'Invalid API key.' };
        }

        const userId = userResult[0].id;

        // Step 2: Fetch items that belong to the user
        const result = await getUserItemsWithDetails(dbConnection, userId);
        
        return { success: true, result};

    } catch (error) {
        console.error('Error fetching items:', error);
        return { success: false, message: 'Failed to retrieve items.\n' + error };
    }
}

async function getUserItemsWithDetails(dbConnection, userId) {
    try {
        const [items] = await dbConnection.execute(
            `
            SELECT 
                items.id,
                items.name,
                items.description,
                items.attack_modifier,
                items.defense_modifier,
                items.magic_modifier,
                bonus1.effect_name AS bonus_effect_1_name,
                bonus1.effect_description AS bonus_effect_1_description,
                bonus2.effect_name AS bonus_effect_2_name,
                bonus2.effect_description AS bonus_effect_2_description,
                bonus3.effect_name AS bonus_effect_3_name,
                bonus3.effect_description AS bonus_effect_3_description,
                items.price
            FROM 
                items
            LEFT JOIN bonus_effects AS bonus1 ON items.bonus_effect_1_id = bonus1.id
            LEFT JOIN bonus_effects AS bonus2 ON items.bonus_effect_2_id = bonus2.id
            LEFT JOIN bonus_effects AS bonus3 ON items.bonus_effect_3_id = bonus3.id
            WHERE 
                items.owner_id = ?
            `,
            [userId]
        );

        return items;
    } catch (error) {
        console.error('Error fetching user items:', error);
        throw error;
    }
}

async function getBankAmount(dbConnection, apiKey) {
    try {
        const [bankAmount] = await dbConnection.execute(
            `SELECT amount 
            FROM bank_accounts 
            INNER JOIN users ON users.bank_account_id = bank_accounts.id
            WHERE users.apikey = ?`, 
            [apiKey]
        );

        return {
            success: true,
            bank_amount: bankAmount[0].amount
        };
    } catch (error) {
        console.error('Error fetching items:', error);
        throw error;
    }
}

async function getPocketMoney(dbConnection, apiKey) {
    try {
        const [poketMoney] = await dbConnection.execute(
            `SELECT pocket_money 
            FROM users
            WHERE users.apikey = ?`, 
            [apiKey]
        );

        return {
            success: true,
            pocket_money: poketMoney[0].pocket_money
        };
    } catch (error) {
        console.error('Error fetching items:', error);
        throw error;
    }
}

async function getUserByApiKey(dbConnection, apiKey) {
    try {
        const [user] = await dbConnection.execute(
            `SELECT * 
            FROM users
            WHERE users.apikey = ?`, 
            [apiKey]
        );

        return user[0];
    } catch (error) {
        console.error('Error fetching items:', error);
        throw error;
    }
}

async function transferMoneyFromBankToPocket(dbConnection, apiKey, amount){
    moneyInBank = await getBankAmount(dbConnection, apiKey);
    moneyInPocket = await getPocketMoney(dbConnection, apiKey);

    user = await getUserByApiKey(dbConnection, apiKey);

    updatedMoneyInBank = moneyInBank.bank_amount - amount;
    updatedMoneyInPocket = parseFloat(moneyInPocket.pocket_money) + amount;

    // await connection.beginTransaction();

    await dbConnection.execute(
        'UPDATE users SET pocket_money = ? WHERE id = ?',
        [updatedMoneyInPocket, user.id]
    );

    await dbConnection.execute(
        'UPDATE bank_accounts SET amount = ? WHERE id = ?',
        [updatedMoneyInBank, user.bank_account_id]
    );

    await dbConnection.commit();

    return {
        success: true
    }
}

async function transferMoneyFromPocketToBank(dbConnection, apiKey, amount){
    moneyInBank = await getBankAmount(dbConnection, apiKey);
    moneyInPocket = await getPocketMoney(dbConnection, apiKey);

    user = await getUserByApiKey(dbConnection, apiKey);

    updatedMoneyInBank = parseFloat(moneyInBank.bank_amount) + amount;
    updatedMoneyInPocket = moneyInPocket.pocket_money - amount;

  //  await connection.beginTransaction();

    await dbConnection.execute(
        'UPDATE users SET pocket_money = ? WHERE id = ?',
        [updatedMoneyInPocket, user.id]
    );

    await dbConnection.execute(
        'UPDATE bank_accounts SET amount = ? WHERE id = ?',
        [updatedMoneyInBank, user.bank_account_id]
    );

    await dbConnection.commit();

    return {
        success: true
    }
}

async function moveItemToAuction(dbConnection, itemId, originalOwnerId, initialValue) {
    try {
        // Start a transaction to ensure atomic operations
        await dbConnection.beginTransaction();

        // Step 1: Update the item owner to 0
        await dbConnection.execute(
            'UPDATE items SET owner_id = ? WHERE id = ?',
            [0, itemId]
        );

        // Step 2: Insert the item into auction_items_on_display
        await dbConnection.execute(
            `INSERT INTO auction_items_on_display (item_id, original_owner_id, max_bidder, max_sum)
             VALUES (?, ?, NULL, ?)`,
            [itemId, originalOwnerId, initialValue]
        );

        // Commit the transaction
        await dbConnection.commit();

        console.log(`Item ${itemId} moved to auction successfully.`);
        return { success: true, message: `Item ${itemId} moved to auction successfully.` };
    } catch (error) {
        console.error('Error moving item to auction:', error);
        if (dbConnection) {
            await dbConnection.rollback();
        }
        return { success: false, message: 'Failed to move item to auction.' };
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

app.get('/inventory', async (req, res) => {
    const { apiKey } = req.query;

    if (!apiKey) {
        return res.status(400).json({ success: false, message: 'apiKey parameter is required.' });
    }
    
    try {
        (async () => {
            const dbConnection = await mysql.createConnection(DB_CONNECTION_DATA);
            try {
                const result = await getItemsByApiKey(dbConnection, apiKey);

                if (!result.success) {
                    return res.status(401).json(result);
                }

                return res.status(200).json(result);
            } finally {
                await dbConnection.end();
            }
        })();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'An error occurred while fetching inventory.' });
    }
});

app.post('/add_money_to_bank', async (req, res) => {
    const { apiKey, amount } = req.body;

    if (!apiKey || amount === undefined) {
        return res.status(400).json({ error: 'apiKey and amount parameters are required.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    try {
        
        (async () => {
            const dbConnection = await mysql.createConnection(DB_CONNECTION_DATA);

            const response = await transferMoneyFromPocketToBank(dbConnection, apiKey, parsedAmount);

            res.status(201).json(response);
        })();
    
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating user.' });
    }
});

app.post('/get_money_from_bank', async (req, res) => {
    const { apiKey, amount } = req.body;

    if (!apiKey || amount === undefined) {
        return res.status(400).json({ error: 'apiKey and amount parameters are required.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    try {
        
        (async () => {
            const dbConnection = await mysql.createConnection(DB_CONNECTION_DATA);

            const response = await transferMoneyFromBankToPocket(dbConnection, apiKey, parsedAmount);

            res.status(201).json(response);
        })();
    
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating user.' });
    }
});

app.get('/bank_amount', async (req, res) => {
    const { apiKey } = req.query;

    if (!apiKey) {
        return res.status(400).json({ success: false, message: 'apiKey parameter is required.' });
    }
    
    try {
        (async () => {
            const dbConnection = await mysql.createConnection(DB_CONNECTION_DATA);
            try {
                const result = await getBankAmount(dbConnection, apiKey);

                if (!result.success) {
                    return res.status(401).json(result);
                }

                return res.status(200).json(result);
            } finally {
                await dbConnection.end();
            }
        })();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'An error occurred while fetching inventory.' });
    }
});

app.get('/pocket_money_amount', async (req, res) => {
    const { apiKey } = req.query;

    if (!apiKey) {
        return res.status(400).json({ success: false, message: 'apiKey parameter is required.' });
    }
    
    try {
        (async () => {
            const dbConnection = await mysql.createConnection(DB_CONNECTION_DATA);
            try {
                const result = await getPocketMoney(dbConnection, apiKey);

                if (!result.success) {
                    return res.status(401).json(result);
                }

                return res.status(200).json(result);
            } finally {
                await dbConnection.end();
            }
        })();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'An error occurred while fetching inventory.' });
    }
});

app.post('/move_item_to_auction', async (req, res) => {
    const {apiKey, itemId, startingValue} = req.body;

    if (!apiKey || !itemId) {
        return res.status(400).json({ success: false, message: 'apiKey and itemId are required.' });
    }

    // Validate apiKey and get userId
    try {
        (async () => {
            const dbConnection = await mysql.createConnection(DB_CONNECTION_DATA);
            try {
                const currentUser = await getUserByApiKey(dbConnection, apiKey)

                if (currentUser === null) {
                    return res.status(401).json({ success: false, message: 'Invalid apiKey.' });
                }

                const userId = currentUser.id;

                // Optional: Verify that the item belongs to the user
                const [itemRows] = await dbConnection.execute(
                    'SELECT owner_id FROM items WHERE id = ?',
                    [itemId]
                );

                if (itemRows.length === 0) {
                    return res.status(404).json({ success: false, message: 'Item not found.' });
                }

                if (itemRows[0].owner_id !== userId) {
                    return res.status(403).json({ success: false, message: 'You do not own this item.' });
                }

                // Move the item to auction
                const result = await moveItemToAuction(dbConnection, itemId, itemRows[0].owner_id, startingValue);

                if (result.success) {
                    return res.status(200).json({
                        success: true,
                        auctionItemId: result.auctionItemId,
                        message: 'Item moved to auction display successfully.'
                    });
                } else {
                    return res.status(500).json({ success: false, message: result.message });
                }
            } finally {
                await dbConnection.end();
            }
        })();
    } catch (error) {
        console.error('Error in /move_item_to_auction:', error.message);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching inventory.' });
    }
});

// // Test ITEM GENERATION
// (async () => {
//     const dbConnection = await mysql.createConnection(DB_CONNECTION_DATA);

//     try {
//         const result = await generateRandomItem(dbConnection);

//         console.log(result);

//     } finally {
//          await dbConnection.end();
//     }
// })();

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});