# LMS Platform 🎓

An online learning marketplace designed to seamlessly connect educators with students through comprehensive course management, featuring secure payments and real-time progress tracking.

## 🚀 Features

### For Educators
- **Course Management**: Create, edit, and publish courses with chapters and lectures
- **Content Organization**: Structure courses with nested chapters and video lectures
- **Student Analytics**: Track enrolled students and course performance
- **Revenue Dashboard**: Monitor course sales and earnings

### For Students
- **Course Discovery**: Browse and search available courses
- **Secure Enrollment**: Purchase courses with Stripe payment integration
- **Progress Tracking**: Real-time tracking of completed lectures and chapters
- **Video Learning**: Stream course content with YouTube integration
- **Course Ratings**: Rate and review completed courses

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Clerk** - Authentication and user management
- **Axios** - HTTP client
- **Quill** - Rich text editor for course descriptions
- **React YouTube** - Video player integration

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database and ODM
- **Clerk Express** - Authentication middleware
- **Stripe** - Payment processing
- **Cloudinary** - Media asset management
- **Multer** - File upload handling

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── pages/
│   │   │   ├── educator/  # Educator dashboard pages
│   │   │   └── student/   # Student learning pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── server/                # Backend Node.js application
    ├── api/              # API utilities
    ├── configs/          # Database and service configs
    ├── controller/       # Request handlers
    ├── middlewares/      # Custom middleware
    ├── models/           # MongoDB schemas
    │   ├── Course.js
    │   ├── CourseProgress.js
    │   ├── Purchase.js
    │   └── User.js
    ├── routes/           # API routes
    ├── server.js
    └── package.json
```

## 🗄️ Database Schema

### Course Model
- Nested structure with chapters and lectures
- Support for course ratings and reviews
- Educator and enrolled students references
- Pricing with discount support

### User Model
- Clerk authentication integration
- Enrolled courses tracking
- Profile information

### CourseProgress Model
- Real-time progress tracking
- Lecture completion status
- Course completion tracking

### Purchase Model
- Stripe payment records
- Transaction history

## 🔐 Authentication & Authorization

- **Clerk Authentication**: Secure user authentication with social login support
- **Role-Based Access Control**: Separate permissions for educators and students
- **Webhook Integration**: Automated user synchronization with Clerk

## 💳 Payment Integration

- **Stripe Payment Gateway**: Secure payment processing
- **Webhook Handling**: Automated enrollment after successful payment
- **Purchase History**: Track all transactions

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Clerk account
- Stripe account
- Cloudinary account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd client
npm install
```

4. Configure environment variables

Create `.env` file in the `server` directory:
```env
MONGODB_URI=your_mongodb_connection_string
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PORT=5000
```

Create `.env` file in the `client` directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:5000
```

5. Start the development servers

Backend:
```bash
cd server
npm run server
```

Frontend:
```bash
cd client
npm run dev
```

## 📝 API Endpoints

### Educator Routes
- `POST /api/educator/add-course` - Create new course
- `GET /api/educator/courses` - Get educator's courses
- `PUT /api/educator/course/:id` - Update course
- `DELETE /api/educator/course/:id` - Delete course

### Course Routes
- `GET /api/course/list` - Get all published courses
- `GET /api/course/:id` - Get course details
- `POST /api/course/rate` - Rate a course

### User Routes
- `GET /api/user/profile` - Get user profile
- `GET /api/user/enrollments` - Get enrolled courses
- `GET /api/user/progress/:courseId` - Get course progress

### Webhooks
- `POST /clerk` - Clerk user synchronization
- `POST /webhook/stripe` - Stripe payment confirmation

## 🎨 Key Features Implementation

### Progress Tracking
Real-time tracking of lecture completion with visual progress indicators using `rc-progress` library.

### Video Streaming
Integrated YouTube player for seamless video content delivery with playback controls.

### Rich Text Editor
Quill editor integration for creating detailed course descriptions and content.

### Responsive Design
Mobile-first design approach using Tailwind CSS for optimal viewing on all devices.

## 🔧 Development

### Code Style
- ESLint configuration for code quality
- Consistent naming conventions
- Modular component structure

### Best Practices
- Environment variable management
- Error handling and validation
- Secure authentication flow
- Optimized database queries

## 📦 Deployment

### Backend (Vercel)
The server is configured for Vercel deployment with `vercel.json` configuration.

### Frontend
Build the client for production:
```bash
cd client
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

[Your Name]

## 🙏 Acknowledgments

- Clerk for authentication services
- Stripe for payment processing
- Cloudinary for media management
- MongoDB for database solutions
