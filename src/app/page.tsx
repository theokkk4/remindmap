'use client';

export default function Home() {
  const handleNavigation = () => {
    window.location.href = '/map';
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
          background-attachment: fixed;
          color: #ffffff;
          line-height: 1.6;
          overflow-x: hidden;
          width: 100%;
        }

        h1, h2, h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
        }

        h1 {
          font-size: clamp(2.5rem, 8vw, 5rem);
          line-height: 1.1;
        }

        h2 {
          font-size: clamp(1.75rem, 5vw, 3rem);
          line-height: 1.2;
        }

        h3 {
          font-size: clamp(1.1rem, 3vw, 1.5rem);
        }

        p {
          font-size: 1rem;
          color: #e5e5e5;
          line-height: 1.7;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        nav {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          backdrop-filter: blur(10px);
          background: rgba(10, 14, 39, 0.7);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.25rem 2rem;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.3rem;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logo:hover {
          transform: translateY(-2px);
        }

        .logo-icon {
          font-size: 1.75rem;
        }

        .nav-links {
          display: none;
          gap: 2rem;
          align-items: center;
        }

        .nav-links a {
          color: #e5e5e5;
          text-decoration: none;
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .nav-links a:hover {
          color: #60a5fa;
        }

        .cta-nav {
          background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
          color: white;
          border: none;
          padding: 0.65rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .cta-nav:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
        }

        @media (min-width: 768px) {
          .nav-links {
            display: flex;
          }
        }

        .hero {
          margin-top: 80px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          top: -300px;
          right: -300px;
          z-index: 0;
        }

        .hero::after {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          bottom: -200px;
          left: -200px;
          z-index: 0;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 1000px;
          animation: fadeInUp 0.8s ease;
        }

        .hero h1 {
          background: linear-gradient(135deg, #ffffff 0%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1.5rem;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          color: #e5e5e5;
          margin-bottom: 1rem;
        }

        .hero p {
          font-size: 1.1rem;
          color: #e5e5e5;
          margin-bottom: 3rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
          color: white;
          padding: 1.25rem 3rem;
          border-radius: 24px;
          border: none;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
          text-decoration: none;
        }

        .cta-button:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(59, 130, 246, 0.4);
        }

        .features {
          padding: 6rem 2rem;
          position: relative;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-header h2 {
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff 0%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-header p {
          font-size: 1.1rem;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2.5rem;
          border-radius: 24px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(59, 130, 246, 0.15);
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .feature-card h3 {
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .feature-card p {
          font-size: 0.95rem;
          color: #94a3b8;
        }

        .use-cases {
          padding: 6rem 2rem;
          background: linear-gradient(180deg, transparent 0%, rgba(79, 70, 229, 0.05) 50%, transparent 100%);
        }

        .use-cases h2 {
          background: linear-gradient(135deg, #ffffff 0%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .use-cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          margin-top: 3rem;
        }

        .use-case-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 2rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .use-case-card:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%);
          border-color: rgba(59, 130, 246, 0.5);
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
        }

        .use-case-icon {
          font-size: 2.75rem;
          margin-bottom: 1rem;
        }

        .use-case-card h3 {
          margin-bottom: 0.75rem;
          font-size: 1.25rem;
        }

        .use-case-card p {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .tech-stack {
          padding: 6rem 2rem;
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          margin-top: 3rem;
        }

        .tech-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          text-align: center;
          transition: all 0.3s ease;
        }

        .tech-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-4px);
        }

        .tech-item h4 {
          font-size: 0.95rem;
          color: #60a5fa;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .tech-item p {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .cta-section {
          padding: 6rem 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .cta-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
          padding: 3.5rem 4rem;
          border-radius: 24px;
          backdrop-filter: blur(10px);
          text-align: center;
          max-width: 700px;
          transition: all 0.3s ease;
        }

        .cta-card:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(79, 70, 229, 0.15) 100%);
          border-color: rgba(59, 130, 246, 0.5);
          transform: scale(1.02);
        }

        .cta-card h2 {
          margin-bottom: 1rem;
        }

        .cta-card p {
          margin-bottom: 2.5rem;
          font-size: 1.05rem;
        }

        footer {
          background: rgba(30, 41, 59, 0.5);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3rem 2rem;
          text-align: center;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-bottom {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .feature-card {
          animation: fadeInUp 0.6s ease;
          animation-fill-mode: both;
        }

        .feature-card:nth-child(1) { animation-delay: 0.1s; }
        .feature-card:nth-child(2) { animation-delay: 0.2s; }
        .feature-card:nth-child(3) { animation-delay: 0.3s; }

        .use-case-card {
          animation: fadeInUp 0.6s ease;
          animation-fill-mode: both;
        }

        .use-case-card:nth-child(1) { animation-delay: 0.1s; }
        .use-case-card:nth-child(2) { animation-delay: 0.2s; }
        .use-case-card:nth-child(3) { animation-delay: 0.3s; }
        .use-case-card:nth-child(4) { animation-delay: 0.4s; }

        .tech-item {
          animation: fadeInUp 0.6s ease;
          animation-fill-mode: both;
        }

        .tech-item:nth-child(1) { animation-delay: 0.1s; }
        .tech-item:nth-child(2) { animation-delay: 0.2s; }
        .tech-item:nth-child(3) { animation-delay: 0.3s; }
        .tech-item:nth-child(4) { animation-delay: 0.4s; }
        .tech-item:nth-child(5) { animation-delay: 0.5s; }
        .tech-item:nth-child(6) { animation-delay: 0.6s; }

        @media (max-width: 768px) {
          nav {
            padding: 1rem;
          }

          .hero {
            margin-top: 60px;
            min-height: auto;
            padding: 2rem 1rem;
          }

          .hero h1 {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .hero p {
            font-size: 1rem;
          }

          .features, .use-cases, .tech-stack, .cta-section {
            padding: 4rem 1rem;
          }

          .cta-card {
            padding: 2.5rem 1.5rem;
          }

          .feature-card, .use-case-card, .tech-item {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 1.5rem;
          }

          h2 {
            font-size: 1.2rem;
          }

          .cta-button {
            padding: 1rem 2rem;
            font-size: 1rem;
          }

          .features, .use-cases, .tech-stack {
            padding: 2.5rem 1rem;
          }

          .feature-card, .use-case-card, .tech-item {
            padding: 1.25rem;
          }

          .cta-card {
            padding: 2rem 1rem;
          }

          footer {
            padding: 2rem 1rem;
          }
        }
      `}</style>

      <nav>
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">🧠</span>
            <span>ReMindMap</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#use-cases">Use Cases</a>
            <a href="#tech">Tech</a>
            <button onClick={handleNavigation} className="cta-nav">Launch App</button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-subtitle">AI-Powered Mind Mapping for Teams & Individuals</div>
          <h1>Think Smarter, Not Harder</h1>
          <p>The only mind mapping tool with AI-powered deadline risk analysis and conflict detection. Beautiful glass-morphism design meets intelligent insights. Perfect for teams, students, and professionals managing complex projects.</p>
          <button onClick={handleNavigation} className="cta-button">
            Try the App
            <span>✨</span>
          </button>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>What Makes ReMindMap Different</h2>
            <p>A mind mapping tool that's not just functional—it's beautiful, intelligent, and a joy to use</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Modern Glass Design</h3>
              <p>Glossy, translucent nodes with gradient fills and shine effects. Every interaction feels like interacting with glass spheres floating in digital space.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Recurring Reminders</h3>
              <p>Set daily, weekly, or monthly reminders for any node. Browser notifications keep you on track with habits, deadlines, and recurring tasks.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Priority-Based Organization</h3>
              <p>Color-coded by urgency with Low, Medium, High, and Urgent levels. Instantly see what matters most in your mind map.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Insights</h3>
              <p>Intelligent deadline risk analysis, conflict detection, and workload distribution insights. Get proactive warnings about competing deadlines and overload.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Smart Conflict Detection</h3>
              <p>Automatically detects scheduling conflicts, overlapping deadlines, and workload imbalances. Unique to ReMindMap - no other mind mapping tool does this.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Privacy-First Security</h3>
              <p>Enterprise-grade local data storage with IndexedDB. Your data never leaves your device. Perfect for teams handling sensitive information.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="use-cases" className="use-cases">
        <div className="container">
          <div className="section-header">
            <h2>Perfect for Any Workflow</h2>
            <p>From brainstorming to project management to research</p>
          </div>
          <div className="use-cases-grid">
            <div className="use-case-card">
              <div className="use-case-icon">💡</div>
              <h3>Brainstorming</h3>
              <p>Quickly capture ideas in visual nodes. Use colors to group related thoughts and organize them spatially on your canvas.</p>
            </div>
            <div className="use-case-card">
              <div className="use-case-icon">📊</div>
              <h3>Project Planning</h3>
              <p>Break down projects into tasks. Use priority levels (low, medium, high, urgent) with color-coding to see what needs attention first.</p>
            </div>
            <div className="use-case-card">
              <div className="use-case-icon">📚</div>
              <h3>Study Notes</h3>
              <p>Create visual summaries of topics you're learning. Add descriptions, due dates for exams, and organize notes by subject using colors.</p>
            </div>
            <div className="use-case-card">
              <div className="use-case-icon">🔔</div>
              <h3>Task Reminders</h3>
              <p>Set recurring reminders (daily, weekly, monthly) with browser notifications for habits, deadlines, or recurring tasks.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="tech" className="tech-stack">
        <div className="container">
          <div className="section-header">
            <h2>Built with Modern Tech</h2>
            <p>Cutting-edge stack for performance and scalability</p>
          </div>
          <div className="tech-grid">
            <div className="tech-item">
              <h4>Next.js 16</h4>
              <p>React 19 with App Router</p>
            </div>
            <div className="tech-item">
              <h4>TypeScript</h4>
              <p>Type-safe development</p>
            </div>
            <div className="tech-item">
              <h4>Canvas API</h4>
              <p>GPU-accelerated rendering</p>
            </div>
            <div className="tech-item">
              <h4>Framer Motion</h4>
              <p>Smooth animations</p>
            </div>
            <div className="tech-item">
              <h4>IndexedDB</h4>
              <p>Offline data persistence</p>
            </div>
            <div className="tech-item">
              <h4>PWA Support</h4>
              <p>Works offline</p>
            </div>
            <div className="tech-item">
              <h4>AI Algorithms</h4>
              <p>Predictive analytics</p>
            </div>
            <div className="tech-item">
              <h4>LocalStorage Security</h4>
              <p>Privacy-first architecture</p>
            </div>
          </div>
        </div>
      </section>

      <section id="launch" className="cta-section">
        <div className="cta-card">
          <h2>Ready to think differently?</h2>
          <p>Experience the future of mind mapping. Built for hackathon. Designed for innovation.</p>
          <button onClick={handleNavigation} className="cta-button">
            Launch ReMindMap
            <span>🚀</span>
          </button>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="footer-bottom">
            <p>&copy; 2025 ReMindMap. Hackathon Edition. | Making thinking visual, together. ✨</p>
          </div>
        </div>
      </footer>
    </>
  );
}
