# PocketCart: A Smart Shopping & Budgeting Assistant

## Project Description

Many people face frustrations during their weekly shopping: they either forget essential items or realize they've gone over budget only after getting home. PocketCart is a web application designed to solve this problem.

It allows users to create customizable shopping lists before they shop and track their spending in real-time during the trip. As users purchase items, they can check them off the list and enter the price. This provides an instant view of their current cart total, preventing budget shock at checkout. The application also supports querying historical spending by date range, helping users understand their purchasing habits.

The stack: Node.js, Express, MongoDB (official driver), and React (hooks) with Vite. Plain `fetch` is used for AJAX. No Mongoose, axios, or CORS libraries.

## User Personas

- The Budget-Conscious Student: Limited weekly budget, needs live feedback to avoid overspending.
- The Busy Household Manager: Plans ahead with checklists to avoid forgetting essentials.
- The Budget-Tracking Professional: Reviews monthly spending trends for planning.

## User Stories

- As a student, I want to see my running cart total as I shop, so I can make sure I don't go over my weekly budget.
- As a busy household manager, I want to create a clear checklist before I go shopping and check items off as I buy them, so I don't forget any essentials.
- As a professional, I want to query my total shopping expenses by month, so I can understand my spending habits and plan my budget better for next month.

## Features

1. Create and manage shopping lists (CRUD).
2. Track a shopping trip in real time: check off items, enter prices, see running total vs budget.
3. View spending history within a date range.
4. 3 React components (pages) using hooks, each with its own CSS.
5. Database seeded with 1,000+ synthetic records.

## Technical Architecture

The application is a client-side-rendered SPA with a RESTful API backend.

- Frontend (Client)
  - Technology: React (hooks), Vite, vanilla CSS per page component.
  - Responsibility: Fetch data from the backend, render pages, manage local state for lists, trips, and history. Uses `PropTypes` for all page components.

- Backend (Server)
  - Technology: Node.js with Express.
  - Responsibility: Provide RESTful endpoints for CRUD operations on two collections: `shoppingLists` and `shoppingTrips`. Includes date-range query for trip history.
  - Uses the official MongoDB driver only.
  - No prohibited libraries (no axios, no Mongoose, no CORS package).

- Database
  - Technology: MongoDB.
  - Responsibility: Persist shopping lists and trips, with optional references between them.

## Data Models (MongoDB Collections)

Two collections: `shoppingLists` and `shoppingTrips`.

### Shopping Lists (`shoppingLists`)

```
{
  "_id": ObjectId("..."),
  "name": "Weekly Groceries",
  "items": [
    { "itemId": "uuid-1", "name": "Milk", "quantity": 1, "checked": false, "price": null },
    { "itemId": "uuid-2", "name": "Eggs", "quantity": 12, "checked": true, "price": 4.99 }
  ],
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### Shopping Trips (`shoppingTrips`)

```
{
  "_id": ObjectId("..."),
  "listId": ObjectId("..."),
  "items": [
    { "itemId": "uuid-1", "name": "Milk", "quantity": 1, "checked": true, "price": 3.49 },
    { "itemId": "uuid-2", "name": "Eggs", "quantity": 12, "checked": true, "price": 4.99 }
  ],
  "totalAmount": 8.48,
  "tripDate": ISODate("2025-11-01T10:00:00Z"),
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

## REST API Endpoints

- Shopping Lists
  - GET `/api/shopping-lists` — Retrieves all shopping lists.
  - GET `/api/shopping-lists/:id` — Retrieves a single list by id.
  - POST `/api/shopping-lists` — Creates a new list.
  - PUT `/api/shopping-lists/:id` — Updates an existing list.
  - DELETE `/api/shopping-lists/:id` — Deletes a list.

- Shopping Trips
  - GET `/api/shopping-trips` — Retrieves all trips.
  - GET `/api/shopping-trips/:id` — Retrieves a trip by id.
  - POST `/api/shopping-trips` — Creates a new trip.
  - PUT `/api/shopping-trips/:id` — Updates a trip.
  - DELETE `/api/shopping-trips/:id` — Deletes a trip.
  - GET `/api/shopping-trips/history?startDate=&endDate=` — Retrieves trips within a date range.

## Design Mockups

### Mockup 1: Shopping List Page

```
+------------------------------------------------------+
| PocketCart                                  [ + New ]|
+------------------------------------------------------+
| List Name: [ Weekly Groceries           ]  [ Create ]|
|                                                      |
| Shopping Lists                                       |
| +---------------------+  +---------------------+     |
| | Weekly Groceries    |  | Party Supplies     |     |
| | 10 items            |  | 7 items            |     |
| | [View] [Delete]     |  | [View] [Delete]    |     |
| +---------------------+  +---------------------+     |
|                                                      |
+------------------------------------------------------+
```

### Mockup 2: Shopping Trip Page (Real-time total vs budget)

```
+------------------------------------------------------+
| PocketCart                                           |
+------------------------------------------------------+
| # Trip: Weekly Groceries                             |
| Budget: [   60.00 ]   Total: $ 42.35   [ Save Trip ] |
|                                                      |
| Items:                                               |
| [x] Milk (1)      Price: [ 3.49 ]                    |
| [x] Eggs (12)     Price: [ 4.99 ]                    |
| [ ] Bread (1)     Price: [ 2.99 ]                    |
| [ ] Chicken (1kg) Price: [ 9.99 ]                    |
|                                                      |
| Progress: #######-----------  ($42.35 / $60.00)      |
|                                                      |
| [ Back to Lists ]                                    |
|                                                      |
+------------------------------------------------------+
```

### Mockup 3: Spending History Page (Date-range query)

```
+------------------------------------------------------+
| PocketCart                                           |
+------------------------------------------------------+
| Start: [ 2025-11-01 ]  End: [ 2025-11-30 ] [ Search ]|
|                                                      |
| Results (5 trips):                                   |
| 11/02  Weekly Groceries       $ 58.23                |
| 11/09  Weekly Groceries       $ 62.11                |
| 11/16  Weekly Groceries       $ 55.02                |
| 11/23  Weekly Groceries       $ 61.77                |
| 11/29  Weekly Groceries       $ 59.43                |
|                                                      |
| Total: $ 296.56                                      |
|                                                      |
+------------------------------------------------------+
```
