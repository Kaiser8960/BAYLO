# Baylo - Skill Exchange Platform

A full-stack React application for connecting people who want to teach and learn skills from each other.

## Features

- **Authentication**: Firebase Authentication with email/password and social login support
- **Modern UI**: Built with React + Vite, Tailwind CSS, and Framer Motion
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Smooth Animations**: Beautiful transitions between login and register forms
- **Form Validation**: Client-side validation with error handling
- **Firebase Integration**: Authentication and Firestore database
- **PWA Ready**: Structured for Progressive Web App features

## Design Theme

- **Colors**: Cream background (#F9F5EF) and Navy blue (#0C2340)
- **Typography**: Inter and Poppins fonts for modern, bold design
- **Layout**: Two-column responsive layout with smooth animations

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Authentication, Firestore)
- **Routing**: React Router DOM
- **Deployment**: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd baylo
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Get your Firebase config and update `src/firebase/config.js`

4. Update Firebase configuration:
```javascript
// src/firebase/config.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Deployment

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase project:
```bash
firebase init hosting
```

4. Update `.firebaserc` with your project ID:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

5. Deploy:
```bash
npm run deploy
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoginForm.jsx   # Login form component
│   ├── RegisterForm.jsx # Registration form component
│   └── LoadingSpinner.jsx # Loading spinner
├── pages/              # Page components
│   ├── AuthPage.jsx   # Authentication page
│   └── Dashboard.jsx  # User dashboard
├── firebase/           # Firebase configuration
│   ├── config.js      # Firebase app configuration
│   └── auth.js        # Authentication functions
├── App.jsx            # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles with Tailwind
```

## Features Implemented

- ✅ User registration and login
- ✅ Form validation and error handling
- ✅ Remember me functionality
- ✅ Social login buttons (stubs)
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Firebase Authentication
- ✅ Firestore user data storage
- ✅ Protected routes
- ✅ Firebase Hosting configuration

## Future Features

- Profile creation (skills to teach & learn)
- Token system and matchmaking logic
- Real-time messaging
- Skill verification system
- Advanced matching algorithm
- Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.