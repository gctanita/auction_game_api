const { v4: uuidv4 } = require('uuid'); // to generate UUID
const mysql = require('mysql2/promise'); // assuming you're using mysql2 with promises

async function createNewUser(dbConnection, username, password) {
    try {
        // Start a transaction
        await dbConnection.beginTransaction();

        // Step 1: Insert into bank_accounts with amount 0
        const [bankResult] = await dbConnection.execute(
            'INSERT INTO bank_accounts (amount) VALUES (0)'
        );
        
        // Get the id of the newly inserted bank account
        const bankAccountId = bankResult.insertId;

        // Step 2: Generate a UUID for the apikey
        const apikey = uuidv4();

        // Step 3: Insert into users table
        const pocketMoney = 100; // set default pocket money
        await dbConnection.execute(
            'INSERT INTO users (username, password, apikey, bank_account_id, pocket_money) VALUES (?, ?, ?, ?, ?)',
            [username, password, apikey, bankAccountId, pocketMoney]
        );

        // Commit the transaction
        await dbConnection.commit();

        console.log('User created successfully with bank account ID:', bankAccountId);
    } catch (error) {
        // Rollback the transaction in case of error
        await dbConnection.rollback();
        console.error('Error creating user:', error);
        throw error;
    }
}


(async () => {
    const dbConnection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'parolamea',
        database: 'auctionGame'
    });

    try {
        await createNewUser(dbConnection, 'testuser', 'testpassword');
    } finally {
        await dbConnection.end();
    }
})();