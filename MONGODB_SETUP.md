# MongoDB Setup Guide for My Physio App

## Overview
This guide explains how to set up MongoDB for the My Physio application, replacing the current AsyncStorage implementation with a robust database solution.

## Prerequisites
- Node.js (v14 or higher)
- MongoDB installed locally or MongoDB Atlas account
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies
```bash
npm install mongodb mongoose express cors dotenv bcryptjs jsonwebtoken
npm install --save-dev @types/mongodb @types/mongoose @types/express @types/cors @types/bcryptjs @types/jsonwebtoken concurrently
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/my_physio_db
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/my_physio_db

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# API Base URL
API_BASE_URL=http://localhost:3000/api
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # macOS (using Homebrew)
   brew services start mongodb-community
   
   # Windows
   net start MongoDB
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `.env` file
4. Whitelist your IP address

### 4. Running the Application

#### Start MongoDB Server Only
```bash
npm run server
```

#### Start Both Server and Client
```bash
npm run dev:full
```

#### Start Client Only (for development)
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/reset-password` - Reset password

### Patients
- `GET /api/patients` - Get all patients for current user
- `GET /api/patients/:id` - Get specific patient
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Sessions
- `GET /api/sessions` - Get all sessions with optional filters
- `GET /api/sessions/past` - Get completed sessions
- `GET /api/sessions/upcoming` - Get upcoming sessions
- `GET /api/sessions/patient/:patientId` - Get sessions for specific patient
- `GET /api/sessions/:id` - Get specific session
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

## Database Schema

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

## Security Features

1. **JWT Authentication**: All API endpoints require valid JWT tokens
2. **Password Hashing**: Passwords are hashed using bcrypt
3. **User Isolation**: Users can only access their own data
4. **Input Validation**: All inputs are validated before processing
5. **Error Handling**: Comprehensive error handling and logging

## Migration from AsyncStorage

To migrate existing data from AsyncStorage to MongoDB:

1. Export data from AsyncStorage
2. Use the API endpoints to create new records
3. Update the app to use `mongoStorage.ts` instead of `storage.ts`

## Troubleshooting

### Common Issues

1. **Connection Error**: Check MongoDB service is running and connection string is correct
2. **Authentication Error**: Verify JWT token is valid and not expired
3. **CORS Error**: Ensure server is running and CORS is properly configured
4. **Port Conflict**: Change PORT in .env if 3000 is already in use

### Debug Mode
Set `NODE_ENV=development` in `.env` for detailed error messages.

## Performance Considerations

1. **Indexes**: Database indexes are created for frequently queried fields
2. **Pagination**: Consider implementing pagination for large datasets
3. **Caching**: Implement Redis caching for frequently accessed data
4. **Connection Pooling**: MongoDB driver handles connection pooling automatically

## Production Deployment

1. **Environment Variables**: Use strong JWT secrets and secure MongoDB connections
2. **HTTPS**: Enable HTTPS for production API endpoints
3. **Rate Limiting**: Implement API rate limiting
4. **Monitoring**: Set up MongoDB monitoring and logging
5. **Backup**: Configure regular database backups

## Support

For issues or questions:
1. Check MongoDB logs
2. Verify environment configuration
3. Test API endpoints with Postman or similar tools
4. Check network connectivity between client and server
