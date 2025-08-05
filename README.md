# MedBot - Medical Assistant Application

MedBot is a comprehensive medical assistant application that helps patients manage their medical records, chat with doctors, analyze medical reports, and more.

## Project Structure

- **frontend** - React/TypeScript application built with Vite
- **backend** - OCR/PDF processing backend service using Node.js and Gemini AI
- **backendvaibhav** - Authentication and user management backend
- **rag-backend** - Retrieval-Augmented Generation backend for medical knowledge

## Deployment Instructions

### Prerequisites

1. MongoDB Atlas account
2. Google Cloud API key for Gemini AI
3. Render.com account

### Deploying on Render

1. **Fork the repository to your GitHub account**

2. **Connect your GitHub repository to Render**
   - Log in to Render.com
   - Click "New" and select "Blueprint"
   - Connect your GitHub account and select the forked repository
   - Select the repository containing the MedBot application

3. **Configure Environment Variables**
   - Once the blueprint is detected, Render will prompt you to fill in the environment variables
   - Fill in the following environment variables:
     - `MONGO_URI` - Your MongoDB Atlas connection string
     - `GEMINI_API_KEY` - Your Google Gemini AI API key
     - `JWT_SECRET` - A secure random string for JWT token signing

4. **Deploy the Blueprint**
   - Review the configuration and click "Apply"
   - Render will create all services and deploy them

5. **Verify Deployment**
   - Once all services are deployed, check the frontend URL to ensure the application is working correctly
   - Test the authentication, OCR features, and chat functionality

### Manual Deployment

If you prefer to deploy each service individually:

1. **Deploy Backend Services**
   - Deploy each backend service (backend, backendvaibhav, rag-backend) individually on Render
   - Configure environment variables for each service

2. **Deploy Frontend**
   - After backend services are deployed, deploy the frontend
   - Make sure to set the backend URLs in the frontend environment variables

## Local Development

1. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install

   # Install auth backend dependencies
   cd ../backendvaibhav
   npm install

   # Install RAG backend dependencies
   cd ../rag-backend
   npm install
   ```

2. **Run Development Servers**
   ```bash
   # Run frontend
   cd frontend
   npm run dev

   # Run backend services (in separate terminals)
   cd backend
   npm run dev

   cd backendvaibhav
   npm start

   cd rag-backend
   npm run dev
   ```

## Environment Variables

- See `.env.sample` files in each directory for required environment variables