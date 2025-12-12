# Mobile Booking Frontend

React Native frontend application for Mobile Booking Management System.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm start
```

Then press:
- `w` - Open in web browser
- `a` - Open in Android emulator
- `i` - Open in iOS simulator

## 📱 Features

- ✅ Modern UI with clean design
- ✅ Login/Authentication
- ✅ Dashboard with stats
- ✅ Multi-tenant support
- ✅ Responsive design
- ✅ Toast notifications

## 🎨 UI Components

- **Button** - Primary, secondary, outline variants
- **Input** - Form inputs with labels and error handling
- **Card** - Container component with shadow
- **Toast** - Success/error/info notifications

## 🔐 Test Credentials

- **Email**: `admin@example.com`
- **Password**: `password123`

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   └── common/      # Button, Input, Card
├── features/         # Feature modules
│   ├── auth/        # Authentication
│   └── dashboard/   # Dashboard
├── services/         # API services
├── redux/           # State management
├── styles/          # Colors, themes
└── utils/           # Utility functions
```

## 🌐 URLs

- **Frontend**: http://localhost:8083
- **Backend API**: http://localhost:5000

## 🛠️ Development

### Run on Web
```bash
npm start
# Press 'w'
```

### Run on Android
```bash
npm run android
```

### Run on iOS
```bash
npm run ios
```

## 📝 Notes

- Make sure backend is running before starting frontend
- Check `.env` file for API URL configuration
- All API calls are handled through `services/api.ts`
