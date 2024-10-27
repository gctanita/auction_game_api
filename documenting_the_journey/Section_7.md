<style>body {text-align: justify}</style>

# Step 7: Item inventory

We need to build the inventory of the users. However, 1 item can only have 1 owner. So we will:
- modify the items table to add a new column called "owner_id"
- if the owner of the item is the auction house the "owner_id" will be "0"
- modify the item creation to have owner_id "0"
- create a function that obtains the list of items, and supplies it for a GET call
    - the GET inventory call will have to have the parameter "apiKey" 
    - the api will retrun an list of items + their purchase price (value from price column)


Let's get started, with a first prompt:
```
Modify the items table with a new column called "owner_id" (integer)
```
They both replied with the query to alter the table, and both of them suggested in a separate query to add a foreign key. 4o also added a constraint. 

```SQL
ALTER TABLE items
ADD COLUMN owner_id INT;
```

4o
```SQL
ALTER TABLE items
ADD COLUMN owner_id INT,
ADD CONSTRAINT fk_owner
FOREIGN KEY (owner_id) REFERENCES users(id);
```

o1-preview
```SQL
ALTER TABLE items
ADD COLUMN owner_id INT,
ADD FOREIGN KEY (owner_id) REFERENCES users(id);
```

I modified by hand the insert query of the item. I really consider it's too much of a headake to modify it after getting the result from chatGpt :D 

For the next step, let's see what our friend responds to this prompt:
```
- create a function that obtains the list of items, and supplies it for a GET call
    - the GET inventory call will have to have the parameter "apiKey" 
    - the api will retrun an list of items + their purchase price (value from price column)
```

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

// GET /inventory endpoint
app.get('/inventory', async (req, res) => {
    const apiKey = req.query.apiKey;

    if (!apiKey) {
        return res.status(400).json({ error: 'apiKey parameter is required.' });
    }

    let connection;

    try {
        // Create a database connection
        connection = await mysql.createConnection(dbConfig);

        // Validate apiKey
        const [userRows] = await connection.execute(
            'SELECT id FROM users WHERE apikey = ?',
            [apiKey]
        );

        if (userRows.length === 0) {
            return res.status(401).json({ error: 'Invalid apiKey.' });
        }

        const userId = userRows[0].id;

        // Retrieve items owned by the user
        const [itemsRows] = await connection.execute(
            `SELECT id, name, price
             FROM items
             WHERE owner_id = ?`,
            [userId]
        );

        // Return the list of items
        res.status(200).json({
            items: itemsRows
        });

    } catch (error) {
        console.error('Error retrieving inventory:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the inventory.' });
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
    <summary> o4</summary>

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

// Function to get the list of items for a user
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
        const [items] = await dbConnection.execute(
            'SELECT name, price FROM items WHERE owner_id = ?', [userId]
        );

        return { success: true, items };
    } catch (error) {
        console.error('Error fetching items:', error);
        throw error;
    }
}

// GET /inventory endpoint to fetch the user's inventory
app.get('/inventory', async (req, res) => {
    const { apiKey } = req.query;

    if (!apiKey) {
        return res.status(400).json({ success: false, message: 'apiKey parameter is required.' });
    }

    try {
        const result = await getItemsByApiKey(dbConnection, apiKey);

        if (!result.success) {
            return res.status(401).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'An error occurred while fetching inventory.' });
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```
</details>

Comparing the 2 results, the 4o model actually gave me what i wanted: the logic in a function and then the api call. So I will be using the 4o response in my code. 

It did lack the initiation of the DB connection, and i had to put it by hand, but it worked in the end.