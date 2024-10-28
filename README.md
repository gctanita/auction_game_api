# This is the story of the "auction game api"

- [How it all started](#how-it-all-started)
- [The specs](#the-specs)
- [An oportunity](#an-oportunity)

Implementing stuff:
- [Step 1: I need a MariaDB server on my local machine](./documenting_the_journey/Section_1-2.md)
    - install Maria DB server
- [Step 2: DB setup](./documenting_the_journey/Section_1-2.md)
    - create the db tables
- [Step 3: Some seed data for the static tables](./documenting_the_journey/Section_3.md)
    - create inserts for the static tables with info
- [Step 4: Ok, so let's add logic to this. Let's start with creating a new user...](./documenting_the_journey/Section_4.md)
    - implement the logic to **create a user**
- [Step 5: I want to make a post call and create the user](./documenting_the_journey/Section_5.md)
    - implement `POST create_user`
- [Step 6: I need a function that generates a random item](./documenting_the_journey/Section_6.md)
    - implement the logic to **generate a random item**
- [Step 7: Item inventory](./documenting_the_journey/Section_7.md)
    - modify the items table to include owner_id thus creating the user inventory
    - `GET inventory`
- [Step 8: Interacting with the bank](./documenting_the_journey/Section_8.md)
    - `GET bank_amount`
    - `GET pocket_money_amount`
    - `POST add_money_to_bank`
    - `POST get_money_from_bank`
- [Step 9: Get user inventory](./documenting_the_journey/Section_9.md)
    - GET inventory
- [Step 10: Put an item up for auction](./documenting_the_journey/Section_10.md)
    - POST item_for_action
- [Step 11: Get auction items](./documenting_the_journey/Section_11.md)
    - GET auction_items
    - list of items, with end date
- Step 12: Bid for an item
    - POST bid_for_item
- Step 13: Implement first cron for bank interest
    - Generate bank interest every 10 minutes with 10%
- Step 14: Cron to generate new item in auction inventory
    - Generate an item every 20 minutes with owner 0
- Step 15: Cron to generate new items for users
    - Generate an item every 30 minutes for a random 1% of users
- Step 16: Cron to manage auctions
    - Cron removes the items from auction inventory and allocates them to their initial owner or their new owner
    - The cron will also allocate the inital owner part of the money that was transfered to the auction house when the bid was made 
    - The cron will return the money to the bank accounts of the unsuccessffull bidders


## How it all started
This project started out of two things: curiosity and a genuine desire to help others. Curiosity, because I wanted to see just how reliable AI could be, particularly the AI behind ChatGPT. Could it be trusted with complex tasks? Could it understand the intricacies of a project idea dreamed up in the wee hours? In the night that it all started, I couldn’t sleep after helping my significant other set up the espresso machine. Let’s just say, testing coffee at 9 p.m. might not have been the best idea! While I was tossing and turning, an idea sparked: a test API that could serve as a playground for Quality Assurance (QA) and beyond.

As a bit of background, I work in IT as a Quality Assurance Engineer. I’m not a developer, though I write code daily—specifically, code that tests the code developers write. My role involves a different skill set, focusing on critical thinking and attention to detail. After 14 years in the field, I’ve seen a lot, but I always want to learn more. My curiosity was partly about seeing if I could bring to life an API concept based on specifications I sketched out that night. 

The project’s second purpose is to help others. I’ve seen how hard it is to find real, challenging projects to practice on, especially ones where you can truly learn by doing. So, I thought, why not document my journey and share it? By reading about the process, others can benefit from my experiences and perhaps avoid some of the hurdles I’ll likely face. And once the project is complete, I plan to add "challenges" for others—tasks like, "Try to implement this feature" or "Find and fix this bug." I’ll also share my personal insights as a QA professional to guide others through the testing mindset.

This project could serve different roles for different people. For developers, it could be a great exercise in refactoring code from older versions, improving maintainability, or even tackling a “to-do” list of feature requests. Business analysts could take the project specs and turn them into user stories, honing their skills in understanding and defining requirements. Front-end engineers—or developers wanting to break into front-end—could create a user interface, bringing the API to life in a way that’s accessible and intuitive.

And then there’s the idea of communities. In an ideal world, this project could grow beyond me. It could become a shared resource, sustained and improved by a community of QAs, developers, analysts, and engineers. Picture this: study groups or “bench teams” working on different branches of the API simultaneously, each team tackling unique bugs or scenarios. It would be like a training ground for anyone who wanted to learn or practice their skills. And maybe I’ll even record a video talking about it, walking through the specs and quirks of each challenge. That way, business analysts could practice extracting requirements from a real-world “client” (me, in this case!) and create detailed user stories.

In an ideal world everyone could and would learn something from this project, and if that were to happen I’d be thrilled. But even if it just helps one person — if it helps someone improve their skills, feel more confident in their role, or just have fun solving problems — I’ll consider it a success. Whether you’re a QA looking to practice automation, a developer interested in a unique codebase, a business analyst wanting more hands-on experience with specs, a front-end enthusiast ready to build an interface, or just curious of how it is to code by almost fully copy pasting what the AI said, I hope you’ll find something valuable here.


## The specs
First of all these are the specs I managed to higlight in my sleepless night:

- I want an API apllication for a game in Javascript with a MariaDb database
- Each user will send the requests using an API Key to identify who sent the call
- GET auction_items
    - returns a list of items + max_bid_value
- POST bid_for_item
    - input parameters:
        - item_id
        - value
    - returns "successful bid" or an error if something went wrong 
        - e.g. not enough money
        - e.g. invalid item 
- GET inventory
    - returns an list of items + purchase price
- POST item_for_auction
    - returns success or error if something went wrong
        - e.g. invalid item
- GET bank_amount
    - each player has a "bank account"
- GET pocket_money_amount
    - each player has an amount of money they can use for bids
- POST add_money_to_bank
    - for transfering money from pocket to bank
- GET get_money_from_bank
    - for transfering money from bank to pocket 
- POST create_user
    - creates a new user
- CRONS
    - to generate bank interest of 10% every 10 minutes
    - to generate a new item for auction every 20 minutes
    - to generate a new random item and allocate it to a random user inventory every 30 minutes
    - to verify expired auctions, close them, and allocate the item to the winner
        - when putting items to auction they are available for X minutes - random 
        - the auction house will also have an inventory
        - if the item was not sold then return it to previous owner inventory
        - if the item was sold put it in new owner inventory + add money to bank account (80% of max bid)
    - cron to add from auction house inventory to public auction items 
- DB tables
    - 2 or 3 tables to generate the name of the items
    - 1 table of descriptions 
    - 1 table for bonus effects
- an item has:
    - name
    - description
    - attack modifier
    - defense modifier
    - magic modifier
    - bonus effect 1 
    - bonus effect 2
    - bonus effect 3
    - price

- when generating the item, it has a starting price , then it will become the current max bid, and the price of the item bought in the auction
- each item can only have 1 instance, and only 1 owner
- item grading and chances of spawning:
    - normal - 70% chance - no bonus effects
    - rare - 15% chance - 1 bonus effect 
    - unique - 10% chance - 2 bonus effects
    - legendary - 5% chance - 3 bonus effects (all of them)
- starting price formula for new items 
    - (attack modifeir + defense modifier + magic modifier) * 10 + (10^(bounus count))
    - where bouns count is:
        - 0 for normal
        - 1 for rare
        - 2 for unique 
        - 3 for legendary


## An oportunity

This all sounds fantastic, and I must admit—I’m quite proud of the specs. But here comes the big question: who’s going to implement the first draft? Well, why not me? I may not be a developer by trade, but I’ve got enough technical know-how to take a crack at it. Plus, I have a trusty friend by my side: ChatGPT. I don’t need the first version to be perfect; in fact, bugs are part of the learning process and, in a way, a feature of the project!

And as for the architecture? Well, let’s just say that refactoring messy code is also a great learning experience for developers. So, spaghetti code, here we come! (I’m already cringing at myself for this "brilliant" architectural choice, but hey, growth often comes with a bit of self-loathing, right?)

To clarify, over the last two years, I’ve been working primarily with Java for writing automated tests. However, when I need something quick and dirty, JavaScript has always been my go-to guilty pleasure. It’s my "gateway" programming language for experimenting and getting things done fast.

So, with the help of ChatGPT, I’m diving into this project. I’ll be running the same prompts through both the 4.0 model and the 0.1-preview model, and I’ll document the journey along the way. I’ll include the prompts, the responses from each model, and any human adjustments I make at every step. This way, you’ll get a clear view of the process, and perhaps even learn from my decisions (or missteps) as I go.


Here are the links to the convesations I had:
- v.4o => https://chatgpt.com/share/671e4066-2dfc-8001-9ff0-50d2e2c559e4
- v.o1-preview => https://chatgpt.com/share/671e407a-c720-8001-bc00-2586499c9f57 
