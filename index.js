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

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});