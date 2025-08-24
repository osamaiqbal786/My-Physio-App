# My-Physio-App

A comprehensive physiotherapy practice management application built with React Native, Expo, and Node.js. This app helps physiotherapists manage their patients, schedule sessions, track payments, and maintain detailed records of their practice.

## 🏥 Features

### 🔐 Authentication & Security
- **Secure User Registration** with email OTP verification
- **JWT-based Authentication** with 7-day token expiration
- **Password Reset** via email OTP
- **Profile Management** with photo upload capability
- **User Data Isolation** - each user can only access their own data

### 👥 Patient Management
- **Patient Registration** with contact information
- **Patient Search** and filtering capabilities
- **Patient Profile Management** with edit/delete functionality
- **Patient History** tracking and session management

### 📅 Session Management
- **Today's Sessions** - View and manage current day appointments
- **Upcoming Sessions** - Schedule and organize future appointments
- **Past Sessions** - Review completed sessions with payment records
- **Session Creation** with patient selection, date, time, and notes
- **Session Completion** tracking with payment collection
- **Session Filtering** by patient, date range, and completion status

### 💰 Payment Tracking
- **Payment Collection** when marking sessions as complete
- **Payment History** for completed sessions
- **Financial Records** for practice management

### 🎨 User Experience
- **Dark/Light Mode** support with system preference detection
- **Responsive Design** for various screen sizes
- **Intuitive Navigation** with tab-based interface
- **Real-time Updates** and data synchronization
- **Offline Capability** with local data storage

## 🛠️ Technology Stack

### Frontend
- **React Native** 0.76.9
- **Expo SDK** 52.0.0
- **Expo Router** v4 for navigation
- **TypeScript** for type safety
- **AsyncStorage** for local data persistence
- **Lucide React Native** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Nodemailer** for email services
- **CORS** for cross-origin requests

### Development Tools
- **EAS Build** for cross-platform builds
- **Expo CLI** for development
- **TypeScript** for type safety
- **ESLint** for code quality

## 📱 Screenshots

The app features a modern, intuitive interface with:

- **Login/Signup** screens with OTP verification
- **Tab-based Navigation** for easy access to different features
- **Session Cards** with completion status and payment information
- **Patient Cards** with quick actions for session management
- **Form Modals** for data entry and editing
- **Payment Collection** modal for session completion

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- MongoDB (local or MongoDB Atlas)
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/My-Physio-App.git
   cd My-Physio-App
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/my_physio_db
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/my_physio_db
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # JWT Secret (change in production)
   JWT_SECRET=your_jwt_secret_key_here
   
   # Email Configuration (for OTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # API Base URL
   API_BASE_URL=http://localhost:3000/api
   ```

5. **Database Setup**
   
   **Option A: Local MongoDB**
   ```bash
   # macOS (using Homebrew)
   brew install mongodb-community
   brew services start mongodb-community
   
   # Windows
   # Download and install MongoDB from official website
   
   # Linux
   sudo apt-get install mongodb
   sudo systemctl start mongod
   ```
   
   **Option B: MongoDB Atlas**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get connection string and update `.env` file
   - Whitelist your IP address

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```

3. **Run on device/simulator**
   - Install Expo Go app on your device
   - Scan the QR code from the terminal
   - Or press 'i' for iOS simulator, 'a' for Android emulator

## 📖 Usage Guide

### For Physiotherapists

#### Getting Started
1. **Create Account**: Sign up with email and phone number
2. **Verify Email**: Complete OTP verification process
3. **Set Up Profile**: Add profile photo and complete profile information

#### Managing Patients
1. **Add Patients**: Navigate to Patients tab and tap the + button
2. **Patient Information**: Enter name and contact number
3. **Patient Actions**: 
   - Edit patient details
   - Add sessions for the patient
   - View patient's session history
   - Delete patient (removes all associated sessions)

#### Managing Sessions
1. **Today's Sessions**: View and manage current day appointments
2. **Schedule Sessions**: 
   - Select patient from your patient list
   - Choose date and time
   - Add session notes
   - Save session
3. **Session Management**:
   - Mark sessions as complete
   - Collect payment when completing sessions
   - Edit session details
   - Delete sessions if needed

#### Financial Tracking
1. **Payment Collection**: When marking a session complete, enter payment amount
2. **Payment History**: View all completed sessions with payment records
3. **Financial Overview**: Track income from completed sessions

### For Developers

#### Project Structure
```
My-Physio-App/
├── app/                    # Expo Router screens
├── components/             # Reusable UI components
├── utils/                  # Utility functions and contexts
├── types/                  # TypeScript type definitions
├── server/                 # Backend API server
├── assets/                 # Static assets
└── config/                 # Configuration files
```

#### Key Components
- **AuthContext**: Manages user authentication state
- **SessionCard**: Displays session information with actions
- **PatientCard**: Shows patient details with quick actions
- **SessionForm**: Modal for creating/editing sessions
- **PaymentModal**: Collects payment information

#### API Endpoints
- **Authentication**: `/api/auth/*`
- **Patients**: `/api/patients/*`
- **Sessions**: `/api/sessions/*`
- **OTP**: `/api/otp/*`

## 🔧 Development

### Available Scripts

```bash
# Frontend
npm run dev              # Start development server
npm run build:web        # Build for web
npm run android          # Run on Android
npm run ios              # Run on iOS
npm run lint             # Run ESLint

# Backend
cd server
npm run dev              # Start development server
npm start                # Start production server

# EAS Build
eas build --platform android --profile development
eas build --platform android --profile production
```

### Building for Production

1. **Configure EAS Build**
   ```bash
   eas build:configure
   ```

2. **Build for Android**
   ```bash
   eas build --platform android --profile production
   ```

3. **Build for iOS**
   ```bash
   eas build --platform ios --profile production
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `EMAIL_HOST` | SMTP server host | Yes |
| `EMAIL_USER` | Email username | Yes |
| `EMAIL_PASS` | Email password/app password | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** using bcrypt with 12 salt rounds
- **User Data Isolation** - users can only access their own data
- **Input Validation** on both client and server
- **CORS Protection** for API endpoints
- **Environment Variables** for sensitive configuration
- **Email OTP Verification** for account security

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  phoneNumber: String,
  password: String (hashed),
  profileImage: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Patient Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: String,
  contactNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Session Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  patientId: ObjectId (ref: Patient),
  patientName: String,
  date: String,
  time: String,
  notes: String,
  completed: Boolean,
  amount: Number (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Error**
   - Check if MongoDB service is running
   - Verify connection string in `.env` file
   - Ensure network connectivity

2. **Authentication Error**
   - Verify JWT token is valid and not expired
   - Check if user exists in database
   - Ensure proper token format in requests

3. **CORS Error**
   - Verify server is running on correct port
   - Check CORS configuration in server
   - Ensure API base URL is correct

4. **Build Errors**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check Expo SDK version compatibility

### Debug Mode
Set `NODE_ENV=development` in `.env` for detailed error messages and logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the MongoDB setup guide in `MONGODB_SETUP.md`

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - User authentication with OTP verification
  - Patient management
  - Session scheduling and tracking
  - Payment collection
  - Dark/light theme support

---

**My-Physio-App** - Streamlining physiotherapy practice management with modern technology and intuitive design.