<style>body {text-align: justify}</style>

# Step 8: Interacting with the bank
## GET the amount of money available for the user
```
- GET bank_amount
    - get the amount of money from the bank of the user with the given API key
- GET pocket_money_amount
    - get the amount of pocket_money of the user with the given API key
```

I honestly didn't like any of the 2 responses... so I made my own version. o1-preview was closest to what i did for bank_account (it had a join, however it got too much information in it's reply). o4? it didn't actually hallucinate, but given the simplicity of the query, this is...  `'SELECT amount FROM bank_accounts WHERE id = (SELECT bank_account_id FROM users WHERE id = ? LIMIT 1)',`


For the pocket_money_amount, i could have actually used the 01-preview version, but it was more confortable to just copy paste the one above and modify it a little bit. 4o? it considered that it had to obtain the user id and only after that obtain the pocket_money. 

<details>
    <summary>o4</summary>

```javascript
const express = require('express');
const mysql = require('mysql2/promise');

// Create Express app
const app = express();

// Database connection pool
const dbConnection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'your_database'
});

// Function to get the user ID by API key
async function getUserIdByApiKey(dbConnection, apiKey) {
    const [userResult] = await dbConnection.execute(
        'SELECT id FROM users WHERE apikey = ? LIMIT 1', [apiKey]
    );
    
    if (userResult.length === 0) {
        throw new Error('Invalid API key');
    }
    
    return userResult[0].id;
}

// GET /bank_amount endpoint to get the bank account amount of the user
app.get('/bank_amount', async (req, res) => {
    const { apiKey } = req.query;

    if (!apiKey) {
        return res.status(400).json({ success: false, message: 'apiKey parameter is required.' });
    }

    try {
        // Get user ID by apiKey
        const userId = await getUserIdByApiKey(dbConnection, apiKey);

        // Get bank account amount
        const [bankResult] = await dbConnection.execute(
            'SELECT amount FROM bank_accounts WHERE id = (SELECT bank_account_id FROM users WHERE id = ? LIMIT 1)', 
            [userId]
        );

        if (bankResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Bank account not found.' });
        }

        return res.status(200).json({ success: true, bankAmount: bankResult[0].amount });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /pocket_money_amount endpoint to get the pocket money of the user
app.get('/pocket_money_amount', async (req, res) => {
    const { apiKey } = req.query;

    if (!apiKey) {
        return res.status(400).json({ success: false, message: 'apiKey parameter is required.' });
    }

    try {
        // Get user ID by apiKey
        const userId = await getUserIdByApiKey(dbConnection, apiKey);

        // Get pocket money from users table
        const [userResult] = await dbConnection.execute(
            'SELECT pocket_money FROM users WHERE id = ? LIMIT 1', 
            [userId]
        );

        if (userResult.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.status(200).json({ success: true, pocketMoney: userResult[0].pocket_money });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

```
</details>

<details>
    <summary>o1-preview</summary>

```javascript
// Required modules
const express = require('express');
const mysql = require('mysql2/promise');

// Create Express app
const app = express();

// Database configuration (replace with your own credentials)
const dbConfig = {
    host: 'localhost',
    user: 'your_db_user',      // Replace with your DB user
    password: 'your_db_pass',  // Replace with your DB password
    database: 'your_db_name'   // Replace with your DB name
};

// GET /bank_amount endpoint
app.get('/bank_amount', async (req, res) => {
    const apiKey = req.query.apiKey;

    if (!apiKey) {
        return res.status(400).json({ error: 'apiKey parameter is required.' });
    }

    let connection;

    try {
        // Create a database connection
        connection = await mysql.createConnection(dbConfig);

        // Validate apiKey and retrieve user and bank account info
        const [userRows] = await connection.execute(
            `SELECT users.id AS userId, bank_accounts.amount AS bankAmount
             FROM users
             JOIN bank_accounts ON users.bank_account_id = bank_accounts.id
             WHERE users.apikey = ?`,
            [apiKey]
        );

        if (userRows.length === 0) {
            return res.status(401).json({ error: 'Invalid apiKey.' });
        }

        const bankAmount = userRows[0].bankAmount;

        // Return the bank amount
        res.status(200).json({
            bank_amount: bankAmount
        });

    } catch (error) {
        console.error('Error retrieving bank amount:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the bank amount.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// GET /pocket_money_amount endpoint
app.get('/pocket_money_amount', async (req, res) => {
    const apiKey = req.query.apiKey;

    if (!apiKey) {
        return res.status(400).json({ error: 'apiKey parameter is required.' });
    }

    let connection;

    try {
        // Create a database connection
        connection = await mysql.createConnection(dbConfig);

        // Validate apiKey and retrieve user's pocket money
        const [userRows] = await connection.execute(
            'SELECT pocket_money FROM users WHERE apikey = ?',
            [apiKey]
        );

        if (userRows.length === 0) {
            return res.status(401).json({ error: 'Invalid apiKey.' });
        }

        const pocketMoney = userRows[0].pocket_money;

        // Return the pocket money amount
        res.status(200).json({
            pocket_money_amount: pocketMoney
        });

    } catch (error) {
        console.error('Error retrieving pocket money amount:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the pocket money amount.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```
</details>


## POST to transfer money from bank to pocket and vice versa

```
- POST add_money_to_bank
    - for transfering money from pocket to bank
    - will receive 2 parameters: amount and apiKey
- POST get_money_from_bank
    - for transfering money from bank to pocket 
    - will receive 2 parameters: amount and apiKey
```

Here I took even smaller bits and pieces, just used them as a high level model, because I already new how i wanted it to look, and I already knew that i wanted the 2 functions to be almost identical, and stuff. 

<details>
    <summary>o1-preview</summary>

```javascript
// Required modules
const express = require('express');
const mysql = require('mysql2/promise');

// Create Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Database configuration (replace with your own credentials)
const dbConfig = {
    host: 'localhost',
    user: 'your_db_user',      // Replace with your DB user
    password: 'your_db_pass',  // Replace with your DB password
    database: 'your_db_name'   // Replace with your DB name
};

// POST /add_money_to_bank endpoint
app.post('/add_money_to_bank', async (req, res) => {
    const { apiKey, amount } = req.body;

    if (!apiKey || amount === undefined) {
        return res.status(400).json({ error: 'apiKey and amount parameters are required.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    let connection;

    try {
        // Create a database connection
        connection = await mysql.createConnection(dbConfig);

        // Start a transaction
        await connection.beginTransaction();

        // Validate apiKey and get user info
        const [userRows] = await connection.execute(
            `SELECT users.id AS userId, users.pocket_money AS pocketMoney, bank_accounts.id AS bankAccountId
             FROM users
             JOIN bank_accounts ON users.bank_account_id = bank_accounts.id
             WHERE users.apikey = ?`,
            [apiKey]
        );

        if (userRows.length === 0) {
            await connection.rollback();
            return res.status(401).json({ error: 'Invalid apiKey.' });
        }

        const userId = userRows[0].userId;
        const pocketMoney = parseFloat(userRows[0].pocketMoney);
        const bankAccountId = userRows[0].bankAccountId;

        // Check if user has enough pocket money
        if (pocketMoney < parsedAmount) {
            await connection.rollback();
            return res.status(400).json({ error: 'Insufficient pocket money balance.' });
        }

        // Subtract amount from pocket_money
        await connection.execute(
            'UPDATE users SET pocket_money = pocket_money - ? WHERE id = ?',
            [parsedAmount, userId]
        );

        // Add amount to bank account
        await connection.execute(
            'UPDATE bank_accounts SET amount = amount + ? WHERE id = ?',
            [parsedAmount, bankAccountId]
        );

        // Commit the transaction
        await connection.commit();

        res.status(200).json({ message: 'Money transferred to bank successfully.' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error transferring money to bank:', error);
        res.status(500).json({ error: 'An error occurred while transferring money to bank.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// POST /get_money_from_bank endpoint
app.post('/get_money_from_bank', async (req, res) => {
    const { apiKey, amount } = req.body;

    if (!apiKey || amount === undefined) {
        return res.status(400).json({ error: 'apiKey and amount parameters are required.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    let connection;

    try {
        // Create a database connection
        connection = await mysql.createConnection(dbConfig);

        // Start a transaction
        await connection.beginTransaction();

        // Validate apiKey and get user info
        const [userRows] = await connection.execute(
            `SELECT users.id AS userId, users.pocket_money AS pocketMoney, bank_accounts.id AS bankAccountId, bank_accounts.amount AS bankAmount
             FROM users
             JOIN bank_accounts ON users.bank_account_id = bank_accounts.id
             WHERE users.apikey = ?`,
            [apiKey]
        );

        if (userRows.length === 0) {
            await connection.rollback();
            return res.status(401).json({ error: 'Invalid apiKey.' });
        }

        const userId = userRows[0].userId;
        const pocketMoney = parseFloat(userRows[0].pocketMoney);
        const bankAccountId = userRows[0].bankAccountId;
        const bankAmount = parseFloat(userRows[0].bankAmount);

        // Check if bank account has enough money
        if (bankAmount < parsedAmount) {
            await connection.rollback();
            return res.status(400).json({ error: 'Insufficient bank account balance.' });
        }

        // Subtract amount from bank account
        await connection.execute(
            'UPDATE bank_accounts SET amount = amount - ? WHERE id = ?',
            [parsedAmount, bankAccountId]
        );

        // Add amount to pocket_money
        await connection.execute(
            'UPDATE users SET pocket_money = pocket_money + ? WHERE id = ?',
            [parsedAmount, userId]
        );

        // Commit the transaction
        await connection.commit();

        res.status(200).json({ message: 'Money transferred from bank successfully.' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error transferring money from bank:', error);
        res.status(500).json({ error: 'An error occurred while transferring money from bank.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

```
</details>

<details>
    <summary>o4</summary>

```javascript
const express = require('express');
const mysql = require('mysql2/promise');

// Create Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Database connection pool
const dbConnection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'your_database'
});

// Helper function to get the user ID and balances by API key
async function getUserByApiKey(dbConnection, apiKey) {
    const [userResult] = await dbConnection.execute(
        'SELECT id, pocket_money, bank_account_id FROM users WHERE apikey = ? LIMIT 1', 
        [apiKey]
    );

    if (userResult.length === 0) {
        throw new Error('Invalid API key');
    }

    const user = userResult[0];

    const [bankResult] = await dbConnection.execute(
        'SELECT amount FROM bank_accounts WHERE id = ? LIMIT 1', 
        [user.bank_account_id]
    );

    if (bankResult.length === 0) {
        throw new Error('Bank account not found');
    }

    user.bankAmount = bankResult[0].amount;
    return user;
}

// POST /add_money_to_bank
app.post('/add_money_to_bank', async (req, res) => {
    const { amount, apiKey } = req.body;

    if (!amount || !apiKey) {
        return res.status(400).json({ success: false, message: 'amount and apiKey parameters are required.' });
    }

    try {
        const connection = await dbConnection.getConnection();
        await connection.beginTransaction();

        // Get user info by apiKey
        const user = await getUserByApiKey(connection, apiKey);

        // Check if the user has enough pocket money
        if (user.pocket_money < amount) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ success: false, message: 'Not enough pocket money to transfer.' });
        }

        // Deduct the amount from pocket_money and add it to bank account
        await connection.execute('UPDATE users SET pocket_money = pocket_money - ? WHERE id = ?', [amount, user.id]);
        await connection.execute('UPDATE bank_accounts SET amount = amount + ? WHERE id = ?', [amount, user.bank_account_id]);

        // Commit the transaction
        await connection.commit();
        connection.release();

        return res.status(200).json({ success: true, message: `Transferred ${amount} to bank.` });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// POST /get_money_from_bank
app.post('/get_money_from_bank', async (req, res) => {
    const { amount, apiKey } = req.body;

    if (!amount || !apiKey) {
        return res.status(400).json({ success: false, message: 'amount and apiKey parameters are required.' });
    }

    try {
        const connection = await dbConnection.getConnection();
        await connection.beginTransaction();

        // Get user info by apiKey
        const user = await getUserByApiKey(connection, apiKey);

        // Check if the user has enough money in the bank
        if (user.bankAmount < amount) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ success: false, message: 'Not enough money in bank to transfer.' });
        }

        // Deduct the amount from bank account and add it to pocket_money
        await connection.execute('UPDATE bank_accounts SET amount = amount - ? WHERE id = ?', [amount, user.bank_account_id]);
        await connection.execute('UPDATE users SET pocket_money = pocket_money + ? WHERE id = ?', [amount, user.id]);

        // Commit the transaction
        await connection.commit();
        connection.release();

        return res.status(200).json({ success: true, message: `Transferred ${amount} from bank to pocket.` });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

```
</details>