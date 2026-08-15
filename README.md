# UniFood

A restaurant discovery and review platform where users can browse restaurants, check menus, read/post reviews, and chat with restaurant owners in real time.

## About This Repository

This repository is the final, deployed version of a group project developed as part of the Project Management andd Digital Startup(01418371) course.

The team's shared repository couldn't be used directly for deployment — one teammate wasn't able to push properly and sent files separately instead, and deploying from a fork of the group repo also ran into issues on Render. To keep the project moving and meet the presentation deadline, this repository was created fresh from the finished files and used for the actual deployment and final presentation — which is why the commit history here starts from a single "final" commit instead of the full team history.

**Repository history:**

- Original group repository: https://github.com/chayanutinsiri-create/Ngan-Khong-CEO
- Fork used during development (fuller commit history from resolving merge conflicts): https://github.com/Kenshi1112/Ngan-Khong-CEO
- This repository — final version used for deployment: https://github.com/Kenshi1112/unifood *(you are here)*

**Live deployment:** [\[DEPLOYED URL\]](https://unifood-q5at.onrender.com)

## About the Project

Built with Node.js, Express, and MongoDB (Mongoose) on the backend, with a server-rendered HTML/CSS/JS frontend. Real-time chat between customers and restaurant owners runs over WebSockets.

### Key Features

- **Authentication** — register/login with JWT, role-based access (Customer / Restaurant Owner / Admin), protected by reCAPTCHA
- **Restaurant Listings** — browse, search, add, and edit restaurant entries
- **Menu Management** — restaurant owners can manage menu items, with OCR-assisted entry (Tesseract.js)
- **Reviews** — customers can post and read reviews for restaurants
- **Real-time Chat** — WebSocket-based chat between customers and restaurant owners, with chat history stored in MongoDB
- **Issue Reporting** — users can report issues/bugs directly through the app
- **Admin Panel** — administrative view for managing the platform
- **Image Uploads** — Cloudinary-backed image uploads (via Multer)

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (jsonwebtoken), bcryptjs, Google reCAPTCHA
- **Real-time:** WebSocket (`ws`)
- **File Uploads / Media:** Multer, Cloudinary, Sharp, Tesseract.js (OCR)
- **Frontend:** HTML, CSS, JavaScript (served as static files by Express)
- **Deployment:** Render

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB connection string (e.g. MongoDB Atlas)
- A Cloudinary account (for image uploads)
- Google reCAPTCHA site/secret keys

### Installation

```bash
git clone https://github.com/Kenshi1112/unifood.git
cd unifood
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_URL=your_cloudinary_url
JWT_SECRET=your_jwt_secret
RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
PORT=3001
```

### Running the App

```bash
npm run dev   # with nodemon (auto-restart)
# or
npm start
```

The app will be available at `http://localhost:3001`.

## QA / Testing

This project includes QA and software testing work performed on the finished app.

See the [`qa/`](./qa/) directory for the test suite, detailed test cases, and bug report.

## Folder Structure

```text
unifood/
├── app.js                 ← Entry point / server & WebSocket setup
├── config/                ← Database configuration
├── controllers/           ← Route handlers / business logic
├── middleware/             ← Auth & upload middleware
├── models/                 ← Mongoose schemas
├── routes/                 ← Express route definitions
├── public/                 ← Static assets (CSS, JS)
├── views/                  ← Frontend HTML pages
├── qa/                     ← QA / testing work (see qa/README.md)
└── README.md
```
