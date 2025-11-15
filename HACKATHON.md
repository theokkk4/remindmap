# 🧠 ReMindMap - Hackathon Submission

> **Clear your mind. See your world.**

A modern, calming mind mapping PWA that transforms overwhelming thoughts and tasks into beautiful, interactive visual networks.

---

## 🎯 Problem Statement

In today's fast-paced world, students and professionals struggle with:
- **Mental overwhelm** from juggling multiple tasks and responsibilities
- **Anxiety** from scattered thoughts and unclear priorities
- **Poor visualization** of how tasks and self-care connect

**ReMindMap** solves this by providing an intuitive, serene interface to map thoughts and tasks as an interconnected graph, promoting both productivity and mental wellness.

---

## ✨ Key Features

### 🎨 Professional Lucidchart-Inspired Interface
- **Clean toolbar** with intuitive controls (Add, Edit, Delete, Zoom, Export)
- **Edit mode toggle** for seamless switching between view and edit states
- **Context menus** on right-click for quick actions
- **Side panel editor** with live preview and category selection

### 🧘 Mind & Task Management
- **Dual clusters**: "Calm" (self-care) and "Tasks" (productivity)
- **Visual distinction**: Neon violet for calm, cyan for tasks
- **Force-directed graph**: Auto-organizes nodes for optimal clarity
- **Real-time updates**: Changes reflect instantly across the graph

### ⚡ Full CRUD Operations
- **Add nodes**: Ctrl/Cmd + N or toolbar button
- **Edit inline**: Click any node in edit mode
- **Delete**: Right-click menu or Delete key
- **Duplicate**: Clone nodes with one click
- **Bulk clear**: Reset your mind map anytime

### ⌨️ Keyboard Shortcuts (Power User Ready!)
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | Add new node |
| `E` | Toggle edit mode |
| `F` | Fit graph to screen |
| `+/-` | Zoom in/out |
| `Delete/Backspace` | Delete selected node |
| `Esc` | Close panels/deselect |
| `Right-click` | Context menu |

### 💾 Data Management
- **IndexedDB storage**: Offline-first with Dexie
- **Auto-save**: Changes persist automatically
- **Export**: Download as JSON for backup/sharing
- **Demo data**: Pre-seeded examples on first load

### 🎯 Professional UX
- **Smooth animations**: Framer Motion for delightful transitions
- **Responsive design**: Works on desktop, tablet, and mobile
- **Glass morphism**: Modern frosted-glass UI elements
- **Neon accents**: Calming cyan and violet glows
- **Status bar**: Live stats and mode indicators

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript** (Type-safe development)
- **TailwindCSS 4** (Utility-first styling)
- **Framer Motion** (Smooth animations)

### Visualization
- **React Force Graph 2D** (Physics-based graph rendering)
- **D3.js** (Under the hood for graph algorithms)
- **Custom canvas rendering** (Neon glows and edit indicators)

### Data & State
- **Dexie.js** (IndexedDB wrapper)
- **Zod** (Schema validation)
- **React Hooks** (State management)

### PWA & Deployment
- **@ducanh2912/next-pwa** (Service worker generation)
- **Manifest.json** (Installable web app)
- **Optimized fonts** (Google Fonts with Next.js loader)

### Design System
- **Outfit** (Rounded headings)
- **Sora** (Geometric UI elements)
- **Inter** (Body text)
- **Lucide Icons** (Professional iconography)

---

## 🚀 Installation & Setup

```bash
# Clone the repository
git clone [your-repo-url]
cd remindmap

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Visit http://localhost:3000
```

### Build for Production
```bash
npm run build
npm start
```

### Deploy
```bash
# Deploy to Vercel (recommended)
vercel --prod

# Or use npm scripts if configured
npm run deploy
```

---

## 📱 PWA Features

- ✅ **Installable**: Add to home screen on mobile/desktop
- ✅ **Offline-first**: Works without internet connection
- ✅ **Auto-updates**: Service worker keeps app fresh
- ✅ **Native feel**: Standalone display mode
- ✅ **Fast loading**: Optimized assets and caching

---

## 🎨 Design Philosophy

### Frutiger Aero Aesthetic
- Soft radial gradients
- Transparent layering
- Light flares and glows
- Calming color palette

### Neon Minimalism
- High contrast accents
- Clean whitespace
- Purposeful animations
- Focus on clarity

### Calm by Design
- No harsh colors or sharp edges
- Gentle pulsing animations
- Breathing reminders
- Stress-free interactions

---

## 🏆 Hackathon Highlights

### Innovation
- **Mental wellness + productivity** in one app
- **Visual thinking** promotes clarity and reduces anxiety
- **Dual-mode design** (calm vs. tasks) is unique

### Technical Excellence
- **Modern stack** (Next.js 16, React 19, TypeScript)
- **Professional UI/UX** (Lucidchart-quality interface)
- **Full feature set** (CRUD, shortcuts, export, PWA)
- **Performant** (Force-directed layout with canvas rendering)

### User Experience
- **Intuitive** (Learn in 30 seconds)
- **Accessible** (Keyboard navigation, clear labels)
- **Delightful** (Smooth animations, satisfying interactions)
- **Calming** (Designed to reduce stress, not create it)

---

## 📊 Use Cases

### 🎓 Students
- Map assignments and self-care routines
- Visualize connections between tasks
- Balance study time with mental breaks

### 💼 Professionals
- Organize projects and wellness habits
- See how work-life balance connects
- Track both productivity and self-care

### 🧘 Mental Health
- Identify thought patterns
- Connect actions with emotions
- Build healthier routines visually

---

## 🔮 Future Enhancements

- [ ] **Collaboration**: Real-time multi-user editing
- [ ] **AI suggestions**: Auto-categorize nodes
- [ ] **Templates**: Pre-built mind maps for common scenarios
- [ ] **Mobile app**: Native iOS/Android versions
- [ ] **Integrations**: Google Calendar, Notion, Todoist
- [ ] **Advanced export**: PDF, PNG, SVG formats
- [ ] **Themes**: Dark/light mode, custom color schemes
- [ ] **Analytics**: Track usage patterns and insights

---

## 👥 Team

Built with 💙💜 by [Your Name/Team]

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🙏 Acknowledgments

- **Lucidchart** for UI/UX inspiration
- **Frutiger Aero** aesthetic movement
- **Mental wellness community** for feedback
- **Open source** libraries that made this possible

---

**Demo Video**: [Link to demo]  
**Live Site**: [Link to deployment]  
**GitHub Repo**: [Link to code]

---

### ⭐ If you find this helpful, please star the repo!
