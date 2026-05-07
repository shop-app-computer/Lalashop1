# Soshop - Full-Stack Wholesale E-commerce & Social Platform

## Project Overview
Soshop is a modern, full-stack wholesale e-commerce application with integrated social media features ("SupplyGram"). The project is organized as a multi-service workspace containing the main customer storefront, an administrative dashboard, and a centralized API backend.

### Project Structure
- **`/frontend`**: The main customer-facing platform. Built with Next.js 14.2 (Pages Router), TypeScript, and Tailwind CSS. Features an "Instagram-style" social feed, product grids with MOQ-based pricing, and user profiles.
- **`/Admin`**: The administrative management dashboard. Built with Next.js 14.2, TypeScript, and Tailwind CSS. Used for managing users, products, categories, and orders.
- **`/backend`**: The core REST API server. Built with Node.js, Express, and TypeScript. Uses MongoDB (Mongoose) for data persistence.

## Main Technologies
- **Frameworks:** Next.js 14.2 (Frontend/Admin), Express (Backend)
- **Language:** TypeScript
- **Database:** MongoDB via Mongoose
- **Styling:** Tailwind CSS (Mobile-first, Landscape-optimized)
- **Icons:** Lucide React
- **Animations:** Framer Motion (Frontend)
- **Validation:** Zod (Frontend)

## Building and Running
The services must be started independently from their respective directories:

### Backend (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

### Admin (Port 3001)
```bash
cd Admin
npm install
npm run dev
```

## Architecture & Integration
- **API Communication:** Both the Frontend and Admin apps proxy requests starting with `/api` to the backend server running on `http://localhost:5000`.
- **Database:** Uses a single MongoDB instance shared across the platform.
- **Authentication:** JWT-based authentication handled by the Backend and stored in `localStorage` on the clients.

## Development Conventions
- **UI Consistency:** Follow the "Instagram-style" aesthetic for social features. Ensure all pages are responsive and optimized for mobile landscape orientation.
- **Type Safety:** Maintain rigorous TypeScript definitions across all services.
- **Styling:** Use standard Tailwind CSS classes. Avoid custom CSS files unless necessary.
- **API Calls:** Always use the `/api` prefix for backend requests to ensure they are properly proxied via Next.js rewrites.

## Key Features
- **SupplyGram:** A product-focused social feed where users can interact with products as posts.
- **Wholesale Engine:** Support for Minimum Order Quantity (MOQ) and volume-based pricing structures.
- **Admin Dashboard:** Comprehensive management of the e-commerce lifecycle and user data.
