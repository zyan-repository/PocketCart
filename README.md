# PocketCart

A Smart Shopping & Budgeting Assistant

## Description

PocketCart is a web application that helps users create shopping lists and track their spending in real-time during shopping trips. It allows users to create customizable shopping lists, track spending as items are purchased, set budget limits, and query historical spending by date range.

## Author

[Yian Zhou](https://github.com/zyan-repository)

## Class link

[class link](https://northeastern.instructure.com/courses/225993)

## Screenshot

![PocketCart Screenshot](./screenshot.png)

## Features

- User Authentication (Register/Login/Logout)
- Shopping List Management (CRUD operations)
- Real-time Spending Tracking
- Budget Setting and Monitoring
- Historical Spending Query by Date Range
- Item Check-off Functionality

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (native driver)
- **Frontend**: React (with hooks), Vite
- **Authentication**: Passport.js (Local Strategy), express-session, bcrypt
- **API Communication**: Fetch API (no axios)
- **Color Theme**: [Cool Caribbean](https://color.adobe.com/explore) from Adobe Color
  - Tags: #aquatic #blue #green #lavender #ocean #sea #summer #tropical #turquoise
  - Colors: `#6A8CE8` `#B197FF` `#57DBFF` `#7EE8C6` `#90FF9E`

## Project Structure

```text
PocketCart/
├── client/                # Frontend application
│   ├── src/
│   │   ├── pages/        # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ShoppingListPage.jsx
│   │   │   ├── ShoppingTripPage.jsx
│   │   │   └── SpendingHistoryPage.jsx
│   │   ├── components/   # UI components
│   │   ├── context/      # React Context (AuthContext)
│   │   ├── services/     # API service layer
│   │   └── App.jsx       # Main app component
│   └── public/           # Static files
├── server/                # Backend application
│   ├── app.js            # Main server file
│   ├── config/           # Configuration files
│   │   ├── database.js   # Database connection
│   │   └── passport.js   # Passport authentication config
│   ├── middleware/       # Express middleware
│   │   └── auth.js       # Authentication middleware
│   ├── models/           # Data models
│   │   ├── ShoppingList.js
│   │   ├── ShoppingTrip.js
│   │   └── User.js
│   └── routes/           # API routes
│       ├── auth.js
│       ├── shoppingLists.js
│       └── shoppingTrips.js
└── DESIGN.md             # Design document
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current logged-in user

### Shopping Lists

- `GET /api/shopping-lists` - Get all shopping lists
- `GET /api/shopping-lists/:id` - Get single shopping list
- `POST /api/shopping-lists` - Create new shopping list
- `PUT /api/shopping-lists/:id` - Update shopping list
- `DELETE /api/shopping-lists/:id` - Delete shopping list

### Shopping Trips

- `GET /api/shopping-trips` - Get all shopping trips
- `GET /api/shopping-trips/:id` - Get single shopping trip
- `GET /api/shopping-trips/history?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get trips by date range
- `POST /api/shopping-trips` - Create new shopping trip
- `PUT /api/shopping-trips/:id` - Update shopping trip
- `DELETE /api/shopping-trips/:id` - Delete shopping trip

## Database Collections

### shoppingLists

```json
{
  "_id": "ObjectId('...')",
  "name": "Weekly Groceries",
  "items": [
    {
      "itemId": "item-1234567890-abc123",
      "name": "Milk",
      "quantity": 2,
      "checked": false,
      "price": null
    }
  ],
  "createdAt": "ISODate('...')",
  "updatedAt": "ISODate('...')"
}
```

### shoppingTrips

```json
{
  "_id": "ObjectId('...')",
  "listId": "ObjectId('...')",
  "items": [
    {
      "itemId": "item-1234567890-abc123",
      "name": "Milk",
      "price": 3.99,
      "quantity": 2,
      "checked": true
    }
  ],
  "totalAmount": 7.98,
  "tripDate": "ISODate('...')",
  "createdAt": "ISODate('...')",
  "updatedAt": "ISODate('...')"
}
```

### users

```json
{
  "_id": "ObjectId('...')",
  "email": "user@example.com",
  "password": "$2b$10$...(hashed)",
  "name": "John",
  "createdAt": "ISODate('...')"
}
```

## Setup Instructions

### Backend

1. Navigate to the server directory and install dependencies:

   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file in the `server/` directory:

   **Option 1: Using MongoDB Atlas (Recommended)**

   ```bash
   MONGODB_TYPE=atlas
   MONGODB_ATLAS_USERNAME=your_username
   MONGODB_ATLAS_PASSWORD=your_password
   MONGODB_ATLAS_CLUSTER=your-cluster.mongodb.net
   MONGODB_ATLAS_APP_NAME=your-app-name
   DB_NAME=pocketcart
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=your-session-secret-key
   ALLOWED_ORIGINS=http://localhost:5173
   ```

   **Option 2: Using Local MongoDB**

   ```bash
   MONGODB_TYPE=local
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=pocketcart
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=your-session-secret-key
   ALLOWED_ORIGINS=http://localhost:5173
   ```

   **For Production Deployment:**

   ```bash
   NODE_ENV=production
   SESSION_SECRET=your-strong-random-secret-key
   ALLOWED_ORIGINS=http://localhost:5173,https://pocketcart.onrender.com
   ```

   **Note:** 
   - `MONGODB_ATLAS_CLUSTER` and `MONGODB_ATLAS_APP_NAME` are optional. If not set, default values will be used.
   - `ALLOWED_ORIGINS` is a comma-separated list of allowed frontend origins for CORS. Defaults to `http://localhost:5173` if not set.
   - `SESSION_SECRET` should be a strong random string (use `openssl rand -hex 32` to generate one).

3. Start the server:

   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3000`

### Frontend

1. Navigate to the client directory and install dependencies:

   ```bash
   cd client
   npm install
   ```

2. Configure environment variables:

   The frontend uses environment variables to configure the API base URL:
   - **Development**: The `.env` file is already created and left empty to use Vite proxy (`http://localhost:3000`)
   - **Production**: The `.env.production` file is already configured with `VITE_API_BASE_URL=https://pocketcart-server.onrender.com`

   **Note:** 
   - For local development, leave `.env` empty to use Vite's proxy feature
   - For production builds, `.env.production` is automatically used by Vite
   - If you need to change the production backend URL, update `client/.env.production`

3. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173` and proxy API requests to `http://localhost:3000`

## AI Usage

- This README was generated with AI assistance, referencing the structure and format from a previous project ([TechTrove](https://github.com/zyan-repository/TechTrove)).
- Frontend CSS styling and responsive design were enhanced with AI assistance for improved aesthetics and mobile compatibility.
- Color theme was applied to all CSS files using AI assistance, based on the "Cool Caribbean" palette from [Adobe Color](https://color.adobe.com/explore).

## Live Demo

- **Production URL**: [https://pocketcart.onrender.com/](https://pocketcart.onrender.com/)

## License

MIT License - see [LICENSE](./LICENSE) file for details
