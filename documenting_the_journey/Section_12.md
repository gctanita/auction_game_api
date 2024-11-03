# Step 12: Bid for an item

In this section we want to make a POST bid_for_item that will register a bid for a certain item. 

So, what parameters would we need?
- api key of the user making the bet
- the item id they are betting on
- the amount of money that is beeing used 

What will the api do when it receives this call?
- if the sum is greater than max bid
  - then 
    - the previous max_bidder is returned the money, minus a handling fee of 5% from the sum
    - the return of the money is added to the ledger with label "REFUND"
    - the handling fee is added to the ledger with label "FEE_5"
    - the bidded sum of money is retracted from the user pocket_money 
    - the bidded sum of money enters the auction bank account (user_id 0)
    - the transaction is added to the auction_ledger with label "NEW_BID"
    - the item is updated with new max_sum and new max_bidder
  - else 
    - the item is not updated
    - the user is charged with 1% of the bidding amount as auction handling fees
    - the 1% is added to the auction bank accounmt (user_id 0)
    - the bidded amount is added to the ledger with label "FAILED_BID"
    - the handling fee is added to the ledger with label "FEE_1"

ALSO UPDATE
- the call that places the bid, to make an entry in the ledger with "ITEM_ADDED"
    

What is missing?
- An auction_ledger table with the following information:
    - item_id, bidder_id, action, amount, date_time
- An auction_bank account => this can be solved with initializing the bank_accounts with an entry for user_id "0" representing the auction house

Now, writing all this impled some mental gymnastics from my part. It involves understadning the existing system, critical and algoritmic thinking, and so on. Someone with 0 knowledge in IT would not write them down like this. So, would chatGpt be able to write them down if I were to formulate them as a user? 

**Prompt**:
take into account the conversation we have had in this thread until now. The system described in our conversation has been roughly implemented. A user comes to you and needs to instruct the programmers with the modifications needed to implement a new functionality. The request from the user is below:

"""
When a user places a bid, if the amount of money is below the max bid on that item, the money will be returned to him minus a 1% handling fee. If the amount of money offered is bigger than the biggest bidding, then that bid becomes the new max bid. If you had a max bid but were overbid, your money is returned to you minus a 5% handling fee. The money from the users is transfered to the auction bank account with id 0 (if it doesn't exist create it). All actions need to be logged in the auction ledger under their corresponding labels: "REFUND", "FEE_5", "FEE_1", "NEW_BID", "FAILED_BID". Also when an item is added to the auction the ledger should also have an entry of "ITEM_ADDED". 
"""

I know the prompt is actually a best case scenario of a description from a client. And it usually a lot more confusing. So for the results, both of the models provided bits and pieces of code. The o1-preview gave me something closer to what I askedL an logic flow for the bidding. I will try to compare the answers side by side, but will not include the generated code:

| 4o | o1-preview | Comments |
| ------| ------| ------|
| N/A | **User's Request Overview** <br> - Bid Handling: <br> -- If a bid is below the current max bid: <br> --- The bid amount is returned to the user minus a 1% handling fee. <br> -- If a bid is above the current max bid: <br> --- The bid becomes the new max bid. <br> --- If the user had the previous max bid but was overbid, their bid amount is returned minus a 5% handling fee. <br> - Funds Management:  <br> -- Money from users is transferred to the auction bank account with id = 0. <br> -- If this account doesn't exist, it should be created. <br> - Logging: <br> -- All actions are to be logged in the auction ledger under corresponding labels: <br> --- "REFUND", "FEE_5", "FEE_1", "NEW_BID", "FAILED_BID", "ITEM_ADDED". | We have here an overview of what we requested. It is a pretty good summary of what we requested in the prompt|
| -----| ------| ------|
| 1. Database Modifications
a. Ensure Auction Bank Account Exists
Check if the auction bank account with id = 0 exists in the bank_accounts table.
If it doesn't exist, create it.
b. Create the Auction Ledger Table
Create a new table auction_ledger to log all auction-related actions.
Columns Explanation:
id: Unique identifier for each ledger entry.
action_label: The action's label (e.g., "REFUND", "FEE_5").
user_id: ID of the user involved (nullable).
amount: Amount involved in the action (nullable).
item_id: ID of the item involved (nullable).
timestamp: When the action occurred.
| ------| ------|