ShipSpace - Container Space Optimization Platform

ShipSpace is a peer-to-peer marketplace designed to connect shippers who have unused container space with those who need to ship goods. This platform turns wasted space into revenue, creating a more efficient and sustainable global shipping industry.

This project is built using the MERN stack (MongoDB, Express, React, Node.js) with a React frontend (Vite) and a Node.js/Express backend.

Core Features

User Authentication: Secure JWT-based authentication for user registration and login.

Marketplace: Users can find and filter all available container space listings.

Listing Management: Logged-in users can create, view, and delete their own listings.

Pricing Tiers: A "Basic" plan limits users to 5 free listings, prompting them to upgrade.

Analytics Dashboard: A protected route for users to see their personal stats, such as total listings (other stats are mocked for now).

AI Chatbot: An integrated "ShipBot" (powered by the Gemini API) assists users with logistics and price negotiation.

Technology Stack

Backend

Node.js

Express

MongoDB (with Mongoose)

JSON Web Tokens (JWT) for authentication

bcrypt.js for password hashing

Frontend

React (with Vite)

React Router for page navigation

React Context for global state management (Auth)

Axios for API requests

Recharts for the analytics dashboard

Gemini API for the AI Chatbot

How to Run This Project

You must have Node.js and a MongoDB Atlas account.

1. Backend Setup

Navigate to the backend folder:

cd backend


Install dependencies:

npm install


Create your environment file:
Create a file named .env in the /backend folder and add your secrets:

NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_long_random_secret_key


Make sure your MongoDB Atlas "Network Access" list is updated to allow your IP address.

Run the backend server:

npm run dev


Your backend will be running at http://localhost:5001.

2. Frontend Setup

Open a new terminal.

Navigate to the frontend folder:

cd frontend


Install dependencies:

npm install
npm install recharts


Add your Chatbot API Key:
Open frontend/src/components/Chatbot.jsx and add your Google AI Studio API key on line 4:

const API_KEY = "YOUR_GEMINI_API_KEY_GOES_HERE";


Run the frontend server:
(If you are on Windows PowerShell, you may need to run Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass first.)

npm run dev


Your frontend will open at http://localhost:3000 (or a similar port).