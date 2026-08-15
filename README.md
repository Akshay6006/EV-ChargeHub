# EV ChargeHub

EV ChargeHub is a web application for finding and booking electric vehicle charging stations.

The idea behind the project is to make the charging process easier for EV users — from managing their vehicles and finding charging stations to making bookings, tracking charging sessions, and viewing their charging history.

The project also includes a separate admin panel for managing stations, chargers, users, bookings and reports.

---

## Overview

EV ChargeHub has two main sides:

### User Side

Users can:

- Create an account and log in
- Manage their EV vehicle details
- Browse available charging stations
- View station and charger information
- Book a charging slot
- View upcoming and previous bookings
- Manage their wallet and payments
- Track active charging sessions
- View charging history
- Manage their profile

### Admin Side

Administrators have a separate dashboard where they can:

- View overall platform activity
- Manage charging stations
- Manage charging sessions
- View users
- Manage bookings
- Manage chargers
- View reports
- Configure application settings

---

## Features

### Authentication

- Firebase Authentication
- User registration and login
- Email verification
- Protected user routes
- Protected admin routes
- Role-based access for administrators

### Vehicle Management

Users can save their EV details to their account and use the stored vehicle information while making charging bookings.

### Charging Stations

- Browse charging stations
- View station information
- View charger availability
- View charging rates
- Select charging stations while making a booking

### Booking System

Users can:

- Select a charging station
- Select a charger
- Select their vehicle
- Choose a date and time
- Select charging duration
- View booking details
- Track their charging session

### Wallet

The wallet section handles the user's charging-related payment information in one place.

### Charging Sessions

Active charging sessions display information such as:

- Charging station
- Charger
- Charging duration
- Time remaining
- Charging status
- Charging amount

### History

Users can view their previous charging activity and bookings from the history section.

### Admin Dashboard

The admin panel provides a separate interface for managing the platform.

It includes:

- Dashboard overview
- Charging station management
- Charging session management
- User management
- Booking management
- Charger management
- Reports
- Settings

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Lucide React

### Backend Services

The project does not use a separate Node.js/Express server.

Firebase is used as the backend-as-a-service for:

- Firebase Authentication
- Cloud Firestore
- Firebase Storage where required
- Firebase Security Rules

### Deployment

- GitHub
- Vercel

---

Firebase Configuration

Firebase configuration is loaded through environment variables instead of being hardcoded in the source code.

Create a .env file in the project root:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

The .env file should not be committed to Git.

Running the Project Locally
1. Clone the repository
git clone YOUR_REPOSITORY_URL
2. Move into the project
cd EV-ChargeHub
3. Install dependencies
npm install
4. Create the environment file

Create .env in the project root and add the Firebase configuration.

5. Start the development server
npm run dev

The application will be available on the local Vite development URL shown in the terminal.

Production Build

To create a production build:

npm run build

To preview the production build locally:

npm run preview
Firebase Security

Firestore access is controlled using Firebase Security Rules.

The rules handle access for:

User profiles
Vehicles
Charging stations
Bookings
Administrator operations

Users can access their own user-related data, while administrator operations are restricted using the user's admin role.

Application Flow

A typical user flow looks like this:

Register / Login
       ↓
   Dashboard
       ↓
Manage Vehicle
       ↓
Find Charging Station
       ↓
Select Charger
       ↓
Create Booking
       ↓
Wallet / Payment
       ↓
Charging Session
       ↓
Charging History

The administrator has a separate flow:

Admin Login
     ↓
Admin Dashboard
     ↓
Stations / Chargers / Users / Bookings
     ↓
Reports & Settings
Deployment

The frontend can be deployed directly from the GitHub repository using Vercel.

The required Firebase environment variables need to be added to the Vercel project's environment variables before deployment.

The production build command is:

npm run build

The Vite output directory is:

dist
What I Learned From This Project

This project helped me work with a complete frontend application rather than only individual UI screens.

Some of the main areas I worked on were:

Building reusable React components
Managing application state
Working with React Router
Creating protected routes
Implementing role-based admin access
Integrating Firebase Authentication
Working with Firestore
Writing Firestore Security Rules
Managing environment variables
Building responsive dashboards
Handling booking and charging workflows
Deploying a Vite application
Future Improvements

Some features I would like to add in future versions:

Real-time charger availability
Real payment gateway integration
Live charging station location using maps
Push notifications
More detailed analytics for administrators
Better charger hardware/API integration
Automatic charging session updates from real charging equipment

Author

Akshay Kumar

Built as a full-stack-style EV charging platform using React and Firebase, with Firebase handling authentication and database services.
