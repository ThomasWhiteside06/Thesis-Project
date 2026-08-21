# Basic Budget
    Basic Budget is a simple to use budgeting app that was made with user convenience in mind. Upon logging in, the user is greeted by the budget page that shows the user how they are spending their money, in graph form and list form. The user can input their transactions on the transactions page, both incoming and outgoing including reccuring transactions. The user can then select which accounts they want to see the transactions for. The user can also visit the accounts page to view the transactions for the selected account and it gives the user an estimate of their weekly, monthly and yearly balance based on the data they have entered.

# Getting Started
  Client:
    - cd client
    • npm i
    • ng serve --open

  Server:
    * With the current setup, the backend that is being used is the deployed version at https://budget-backend-c188.onrender.com/api/ which may need waking up, so visit that url and let it wake up then you're done
    * If the backend in use becomes the backend in the server folder of this repo (Change the urls in services)
        - cd server
        • npm i
        • npm run start


# Tech Stack
    - Front End
        • Angular
        • d3 for graphs

    - Back End
        • Express
        • Postgres db using Neon
        • Prisma ORM

# Contributors
    • Thomas Whiteside
    • Ryan Sheng