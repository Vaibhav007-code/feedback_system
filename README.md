# 🏠 AY Residency - Feedback System

A beautiful, minimal, and efficient feedback management system for AY Residency. Residents can submit feedback about their rooms, and the warden can view and manage all feedback from a centralized dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## ✨ Features

### For Residents:
- 📝 **Submit Feedback** - Easy form to report room issues
- ✏️ **Edit Your Feedback** - Update your submissions anytime
- 🗑️ **Delete Feedback** - Remove resolved issues
- 🔒 **Secure** - Can only edit/delete your own feedback
- 📱 **Mobile Responsive** - Works on all devices
- 🌐 **Cross-Device Sync** - Access from anywhere

### For Warden:
- 📊 **Complete Dashboard** - View all feedback at a glance
- 🔍 **Search & Filter** - Find specific feedback easily
- 📑 **Sort Options** - By date or room number
- 🔄 **Auto-Refresh** - Updates every 30 seconds
- 📈 **Statistics** - Total feedbacks and unique rooms

### Design:
- 🎨 **Beautiful UI** - Glassmorphism with gradient accents
- ⚡ **Smooth Animations** - Premium feel
- 🌙 **Dark Theme** - Easy on the eyes
- ✨ **Modern Design** - 2024 web standards

## 🚀 Quick Start

### Deploy to Vercel (Recommended)
1. Click this button: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
2. Connect your GitHub account
3. Import this repository
4. Add Vercel Postgres database (see [DEPLOYMENT.md](./DEPLOYMENT.md))
5. Deploy!

**📖 Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

**Note:** For full functionality locally, you need to set up Vercel Postgres and environment variables.

## 📱 Usage

### Residents
1. Visit the website
2. Fill in Room Number, Name, and Problem
3. Click "Submit Feedback"
4. Edit or delete your feedback anytime

### Warden
1. Visit `your-site.com/warden`
2. View all feedback
3. Search and filter as needed

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4 + Custom CSS
- **Database:** Vercel Postgres
- **Deployment:** Vercel
- **Icons:** Emoji (no external icon libraries)

## 📁 Project Structure

```
feedback/
├── app/
│   ├── api/
│   │   └── feedbacks/          # API routes
│   ├── warden/                 # Warden dashboard
│   ├── page.tsx                # Main resident page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── lib/
│   └── db.ts                   # Database utilities
├── DEPLOYMENT.md               # Deployment guide
└── ENV_SETUP.md               # Environment setup
```

## 🎨 Customization

### Change Colors
Edit `app/globals.css`:
```css
:root {
  --primary: #6366f1;      /* Change primary color */
  --secondary: #8b5cf6;    /* Change secondary color */
  --accent: #ec4899;       /* Change accent color */
}
```

### Change Residency Name
Update "AY RESIDENCY" in:
- `app/page.tsx`
- `app/warden/page.tsx`

## 🔒 Security & Privacy

- User identification via anonymous UUID (stored in browser)
- Users can only edit/delete their own feedback
- No personal data tracking
- Warden has read-only access

## 📊 Database

Uses Vercel Postgres with a single `feedbacks` table:
- `id` - Unique identifier
- `room_number` - Room number
- `resident_name` - Resident name
- `problem` - Feedback description
- `user_id` - Anonymous user ID
- `created_at` - Submission timestamp
- `updated_at` - Last update timestamp

## 🌟 Why This Project?

- ✅ **No Firebase** - Simple Vercel Postgres
- ✅ **Easy Deploy** - One-click Vercel deployment
- ✅ **Beautiful** - Premium, modern design
- ✅ **Fast** - Built with Next.js 16
- ✅ **Scalable** - Ready for growth
- ✅ **Free** - Vercel free tier is enough for most hostels

## 📧 Support

Having issues? Check:
1. [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
2. Vercel deployment logs
3. Browser console for errors

## 📝 License

MIT License - Feel free to use for your own hostel/residency!

---

**Made with ❤️ for AY Residency**
