# TicketSecure - Advanced Bot Detection Ticket Booking System

A sophisticated React-based ticket booking system with advanced bot detection capabilities to prevent automated ticket scalping and ensure fair access for genuine users.

## 🚀 Features
Core Functionality
- **Multi-step Ticket Booking Process**: Select tickets → Enter passenger details → Choose seats → Confirm booking
- **Real-time Bot Detection**: Advanced behavioral analysis during the booking process
- **Admin Dashboard**: Comprehensive analytics and monitoring of bot detection metrics
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui components

 Advanced Bot Detection Algorithms

#### 1. Typing Behavior Analysis
- **Keystroke Timing**: Analyzes average time between key presses
- **Typing Consistency**: Measures standard deviation of typing speeds (humans are irregular, bots are uniform)
- **Backspace Detection**: Tracks corrections and mistakes (humans make errors, bots don't)
- **Typing Speed Analysis**: Detects unrealistic typing speeds (>200 chars/min or <20 chars/min)

#### 2. Mouse Movement Analysis
- **Cursor Speed**: Monitors mouse movement velocity
- **Path Curvature**: Analyzes mouse path patterns (humans move in curves, bots in straight lines)
- **Click Intervals**: Tracks timing between clicks (unrealistically fast = suspicious)
- **Movement Frequency**: Ensures sufficient mouse activity

#### 3. Form Interaction Patterns
- **Form Fill Time**: Total time to complete booking (humans take longer, bots complete in <2 seconds)
- **Field Interaction**: Tracks focus, blur, and input events on form fields
- **Copy/Paste Detection**: Monitors clipboard events (excessive use = suspicious)

#### 4. Request Pattern Analysis
- **Request Frequency**: Tracks number of booking requests per second from same user/IP
- **Session Duration**: Analyzes overall session timing patterns

#### 5. Device Fingerprinting
- **Browser Fingerprint**: Generates unique device signature based on:
  - User Agent
  - Screen resolution
  - Timezone
  - Hardware concurrency
  - Canvas fingerprinting
  - Touch points

Risk Scoring System
The system calculates a comprehensive risk score (0-100%) based on:
- **Typing Behavior (40% weight)**: Speed, consistency, corrections
- **Mouse Behavior (30% weight)**: Speed, path curvature, frequency
- **Form Behavior (20% weight)**: Fill time, interactions
- **Request Patterns (10% weight)**: Frequency,
-
- Bot Blocking
- **Automatic Detection**: Users flagged as bots (risk score >70%) are blocked
- **Graceful Blocking**: Professional modal explaining the detection
- **Retry Mechanism**: Legitimate users can retry after being blocked
- **Support Contact**: Easy access to support for false positives

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **React Hook Form** for form management

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** for data storage
- **Row Level Security (RLS)** for data protection

Bot Detection
- **Custom React Hooks** for interaction tracking
- **Real-time Analytics** with Supabase
- **Machine Learning Ready** data collection

📊 Admin Dashboard

The admin dashboard provides comprehensive analytics:

 Overview Metrics
- Total sessions tracked
- Bot vs human session counts
- Average risk scores
- Booking success/block rates

 Detailed Analytics
- **Session Details**: Individual session analysis
- **Risk Factor Breakdown**: Most common bot indicators
- **Hourly Statistics**: Bot detection patterns over time
- **Booking History**: Success and blocked booking attempts

Access Control
- Admin-only access (email: `admin@ticketsecure.com`)
- Real-time data refresh
- Export capabilities for further analysis

 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd human-guard-booking-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration script in `supabase/migrations/`
   - Update the Supabase credentials in `src/integrations/supabase/client.ts`

4. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Access the application**
   - Main app: `http://localhost:8080`
   - Admin dashboard: `http://localhost:8080/admin`

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Bot Detection Thresholds
Adjust detection sensitivity in `src/hooks/useAdvancedBotDetection.ts`:
```typescript
// Risk score thresholds
const BOT_THRESHOLD = 70; // Block users above this score
const WARNING_THRESHOLD = 50; // Show warnings above this score

// Typing speed limits
const MAX_TYPING_SPEED = 200; // chars/min
const MIN_TYPING_SPEED = 20;  // chars/min

// Form fill time limits
const MIN_FORM_TIME = 2000; // milliseconds
```

## 📈 Data Collection

The system collects comprehensive interaction data:

### Interaction Types
- `mouse_movement`: Mouse position and speed
- `keystroke`: Key presses with timing
- `click`: Click events with intervals
- `form_interaction`: Form field focus/blur/input
- `clipboard`: Copy/paste events
- `session_summary`: Final analysis results

### Data Storage
All data is stored in Supabase with:
- **Session tracking**: Unique session IDs
- **User association**: Linked to authenticated users
- **Timestamp tracking**: Precise timing data
- **Risk scoring**: Calculated bot probability

## 🔒 Security Features

### Data Protection
- **Row Level Security**: Database-level access control
- **User Isolation**: Users can only access their own data
- **Secure Storage**: All sensitive data encrypted

### Bot Prevention
- **Real-time Analysis**: Continuous monitoring during booking
- **Multiple Detection Methods**: Layered approach to bot detection
- **False Positive Handling**: Support system for legitimate users

## 🧪 Testing Bot Detection

### Simulate Human Behavior
- Type at normal speed (30-60 chars/min)
- Make occasional mistakes and corrections
- Move mouse naturally with curves
- Take reasonable time to fill forms
- Use normal click intervals

### Simulate Bot Behavior
- Type extremely fast (>200 chars/min)
- No backspaces or corrections
- Straight mouse movements
- Complete forms in <2 seconds
- Regular click intervals

## 📱 User Experience

### For Legitimate Users
- **Smooth Booking Process**: Intuitive multi-step flow
- **Real-time Feedback**: Live bot detection status
- **Transparent Blocking**: Clear explanation if blocked
- **Support Access**: Easy contact for issues

### For Administrators
- **Comprehensive Analytics**: Detailed bot detection metrics
- **Real-time Monitoring**: Live session tracking
- **Risk Analysis**: Detailed breakdown of detection factors
- **Data Export**: Analytics for further processing

## 🔮 Future Enhancements

### Machine Learning Integration
- **scikit-learn/PyTorch**: ML model integration
- **Pattern Recognition**: Advanced behavioral analysis
- **Adaptive Thresholds**: Dynamic risk scoring
- **Continuous Learning**: Model improvement over time

### Additional Features
- **CAPTCHA Integration**: Additional verification layer
- **Rate Limiting**: Request frequency controls
- **IP Analysis**: Geographic and network analysis
- **Device Tracking**: Cross-session device fingerprinting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support or questions:
- Email: support@ticketsecure.com
- Admin Dashboard: `/admin` (admin@ticketsecure.com)
- Documentation: See this README

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Supabase** for the backend infrastructure
- **Tailwind CSS** for the styling framework
- **React** community for the excellent ecosystem
