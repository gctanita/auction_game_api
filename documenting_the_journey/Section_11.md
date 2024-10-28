# Step 11: Get auction items
    - GET auction_items
    - list of items, with end date

Ok, soo... Damn... end_date... uell... didn't put that in section 10 didn't i? (Of course I didn't)...

Then, let's make a plan:
1. modify the code we wrote in section 11 to include the end date:
    - modify the DB
    - modify the function that makes the insert

2. create a function that obtains the list of items that are up for auction
3. write the API call for GET auction_items

## Adding the end_date 

Prompt: 
> Modify the table "auction_items_on_display" to include an extra column named end_date

The 4o model gabe me the alter table SQL, and that's it.
The o1-preview model:
- gave the alter table SQL
- talked about nullability
- talked about setting a default value for the column
- told me how to update the existing records
- told me how to index 

For our implementation i will choose the alter table with a default value for the column:
```SQL
ALTER TABLE auction_items_on_display
ADD COLUMN end_date DATETIME NOT NULL DEFAULT (NOW() + INTERVAL 7 DAY);
```

<details>
    <summary>o1-preview</summary>

Certainly! To modify the auction_items_on_display table and add an extra column named end_date, you can use the following SQL ALTER TABLE statement:

```sql
ALTER TABLE auction_items_on_display
ADD COLUMN end_date DATETIME;
```

## Explanation:
### Data Type Selection:
- DATETIME Data Type:
  - The DATETIME data type is suitable for storing both date and time information, which is ideal for an auction end date that includes the exact timestamp when the auction ends.
  - If you only need to store the date without the time, you can use the DATE data type:
```sql
ALTER TABLE auction_items_on_display
ADD COLUMN end_date DATE;
```
### Nullability:
- Allowing NULL Values:
  - By default, the new end_date column will allow NULL values. This means existing records won't be affected immediately.
- Setting NOT NULL:
  - If you want to ensure that every record has an end_date, you can add the NOT NULL constraint:
```sql
ALTER TABLE auction_items_on_display
ADD COLUMN end_date DATETIME NOT NULL;
```
   - Important: If you set NOT NULL, you must provide a default value or update existing records to include an end_date; otherwise, the command will fail if the table already contains data.

### Default Value:
- Setting a Default Value:
  - You can set a default value for the end_date column using the DEFAULT keyword. For example, to set the default end_date to 7 days from the current date and time:
```sql
ALTER TABLE auction_items_on_display
ADD COLUMN end_date DATETIME NOT NULL DEFAULT (NOW() + INTERVAL 7 DAY);
```
  - Note: MySQL versions prior to 8.0.13 do not support expressions as default values. In such cases, you need to handle default values within your application logic.

### Updating Existing Records:
If you have existing records in the auction_items_on_display table, you'll need to update them to include an end_date before enforcing a NOT NULL constraint.

```sql
-- Step 1: Add the column allowing NULL values
ALTER TABLE auction_items_on_display
ADD COLUMN end_date DATETIME;

-- Step 2: Update existing records to have an end_date
UPDATE auction_items_on_display
SET end_date = NOW() + INTERVAL 7 DAY
WHERE end_date IS NULL;

-- Step 3: Modify the column to set NOT NULL constraint
ALTER TABLE auction_items_on_display
MODIFY COLUMN end_date DATETIME NOT NULL;
```
### Indexing (Optional):
If you plan to query or sort the auction_items_on_display table based on the end_date, consider adding an index to improve performance:

```sql
ALTER TABLE auction_items_on_display
ADD INDEX idx_end_date (end_date);
```
## Considerations:
- Existing Data:
  - Ensure you handle existing records appropriately, especially if you're adding a NOT NULL constraint.
- Application Logic:
  - Update your application to provide an end_date value when inserting new records into auction_items_on_display.
- Data Integrity:
  - Using DATETIME allows you to set precise auction end times, which can be critical for auction functionality.
## Summary:
- Add the end_date Column:
  - Use ALTER TABLE to add the new column with the appropriate data type.
- Handle Nullability and Defaults:
  - Decide whether the column should allow NULL values or have a default value.
- Update Existing Records:
  - If necessary, update existing records to comply with new constraints.
- Optimize Performance:
  - Consider indexing the end_date column if it will be used frequently in queries.    
</details>



<details>
    <summary>o4</summary>

To modify the auction_items_on_display table by adding a new column called end_date, which could represent the date when the auction ends, you can use the following SQL query:

```sql
ALTER TABLE auction_items_on_display
ADD COLUMN end_date DATETIME;
```
## Explanation
- ALTER TABLE auction_items_on_display: This statement modifies the existing auction_items_on_display table.
- ADD COLUMN end_date DATETIME: This adds a new column named end_date of type DATETIME, which can store both date and time values.

This new column end_date will allow you to set an auction end date for each item in the auction_items_on_display table. You can adjust the DATETIME type if you need more specific handling, such as using DATE (for date only) or TIMESTAMP (if timezone information is important).
</details>

To be honest I can't imagine how to formulate the prompt to modify the code. Probably because it's an extremly simple change. So, I will add in the `POST move_item_to_auction` 2 extra parameters: hours and minutes. To set the expiry date in X hours and Y minutes.

From:
```javascript
 const {apiKey, itemId, startingValue} = req.body;
 ```
 To
 ```javascript
 const {apiKey, itemId, startingValue, hours, minutes} = req.body;
 ```

 I need to calculate the end date, and for this I will write a prompt:
PROMPT:
> In Javascript, I need to calculate the date after today + "hours" and "minutes"

As a human, i don't really understand what this prompt wants from me, so let's see what the 2 models understand from it. 4o understood what I meant and gave me a small function to do this. The o1-preview, gave once again a huge response, and tried to integrate it in the existing code that we have as well. 

I'll take the answer from 4o and integrate in our code:

From:
```javascript
    const result = await moveItemToAuction(dbConnection, itemId, itemRows[0].owner_id, startingValue);
 ```
 To
 ```javascript
    let end_date = new Date();
    end_date.setHours(end_date.getHours() + hours);
    end_date.setMinutes(end_date.getMinutes() + minutes);

    // Move the item to auction
    const result = await moveItemToAuction(dbConnection, itemId, itemRows[0].owner_id, startingValue, end_date);
 ```

And now to modify the function:
From
```javascript
    function moveItemToAuction(dbConnection, itemId, originalOwnerId, initialValue) {
 ```
 To
 ```javascript
    function moveItemToAuction(dbConnection, itemId, originalOwnerId, initialValue, end_date) {
 ```

And
<br>
From
```javascript
    await dbConnection.execute(
            `INSERT INTO auction_items_on_display (item_id, original_owner_id, max_bidder, max_sum)
             VALUES (?, ?, NULL, ?)`,
            [itemId, originalOwnerId, initialValue]
        );
 ```
 To
 ```javascript
    await dbConnection.execute(
            `INSERT INTO auction_items_on_display (item_id, original_owner_id, max_bidder, max_sum, end_date)
             VALUES (?, ?, NULL, ?, ?)`,
            [itemId, originalOwnerId, initialValue, end_date]
        );
 ```

 I will include only the first part to calculate the function, both models produced it, and won't put the full text from o1-preview overkill:
 ```javascript
 function calculateFutureDate(hours, minutes) {
    // Get the current date and time
    const now = new Date();

    // Calculate the future date by adding hours and minutes
    now.setHours(now.getHours() + hours);
    now.setMinutes(now.getMinutes() + minutes);

    return now;
}
```
