import { useState } from "react";
import "./SignIn.css";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Shield,
  Code2,
  Zap,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2
} from "lucide-react";

function SignIn({ onSignIn, onGuestContinue }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null); // 'google' | 'github' | 'email' | null
  const [errorMessage, setErrorMessage] = useState("");

  const [activeModal, setActiveModal] = useState(null); // 'google' | 'github' | null
  const [customGmail, setCustomGmail] = useState("adarshmohit9334@gmail.com");
  const [customGithub, setCustomGithub] = useState("adarshmohit9334");

  const isValidEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(emailStr).trim().toLowerCase());
  };

  // Handle Google OAuth Sign In
  const executeGoogleSignIn = (userEmail = customGmail) => {
    const emailVal = userEmail.trim();

    if (!emailVal) {
      const msg = "No Gmail Account Found! Please enter a valid Gmail address.";
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    if (!isValidEmail(emailVal)) {
      const msg = "No Gmail Account Found! Invalid Gmail format (e.g. name@gmail.com).";
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    setLoadingProvider("google");
    setErrorMessage("");
    setActiveModal(null);

    setTimeout(() => {
      const nameVal = emailVal.split("@")[0] || "Adarsh Kumar";
      const googleUser = {
        name: nameVal,
        email: emailVal,
        role: "Full-Stack Developer",
        plan: "Pro Developer ⚡",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameVal)}`,
        provider: "Google",
        joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
      };

      localStorage.setItem("codesphere_user", JSON.stringify(googleUser));
      localStorage.setItem("codesphere_auth_token", "real-google-jwt-token-adarshmohit9334");
      setLoadingProvider(null);
      onSignIn(googleUser);
    }, 1000);
  };

  // Handle GitHub OAuth Sign In
  const executeGitHubSignIn = (githubUserHandle = customGithub) => {
    const username = githubUserHandle.trim();

    if (!username || username.length < 2) {
      const msg = "GitHub Account Not Found! Please enter a valid GitHub username.";
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    setLoadingProvider("github");
    setErrorMessage("");
    setActiveModal(null);

    setTimeout(() => {
      const githubUser = {
        name: username,
        email: `${username}@users.noreply.github.com`,
        username: username,
        role: `GitHub Developer (@${username})`,
        plan: "Pro Developer ⚡",
        avatar: `https://github.com/${username}.png`,
        provider: "GitHub",
        joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
      };

      localStorage.setItem("codesphere_user", JSON.stringify(githubUser));
      localStorage.setItem("codesphere_auth_token", "real-github-oauth-token-adarshmohit9334");
      setLoadingProvider(null);
      onSignIn(githubUser);
    }, 1000);
  };

  const handleGoogleSignIn = () => {
    setActiveModal("google");
  };

  const handleGitHubSignIn = () => {
    setActiveModal("github");
  };

  // Handle Email/Password Form Submit
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      const msg = "Invalid Credentials! Please enter both email and password.";
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      const msg = "Invalid Email Format! Please enter a valid email address (e.g. name@domain.com).";
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    if (cleanPassword.length < 4) {
      const msg = "Invalid Credentials! Password must be at least 4 characters long.";
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    if (isSignUp && !name.trim()) {
      const msg = "Please enter your full name to register.";
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    setLoadingProvider("email");

    setTimeout(() => {
      const userObj = {
        name: isSignUp ? name.trim() : (cleanEmail.split("@")[0] || "Adarsh Kumar"),
        email: cleanEmail,
        role: "Full-Stack Developer",
        plan: "Pro Developer ⚡",
        provider: "Email",
        joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
      };

      localStorage.setItem("codesphere_user", JSON.stringify(userObj));
      localStorage.setItem("codesphere_auth_token", "mock-email-auth-token-112233");
      setLoadingProvider(null);
      onSignIn(userObj);
    }, 1000);
  };

  return (
    <div className="signin-container">
      <div className="signin-wrapper">
        {/* LEFT HERO / BRANDING PANEL */}
        <div className="signin-hero">
          <div className="signin-brand">
            <svg viewBox="0 0 120 120" width="38" height="38" fill="none">
              <defs>
                <linearGradient id="sgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d2ff" />
                  <stop offset="50%" stopColor="#0066ff" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="sgRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0066ff" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="42" fill="url(#sgGrad)" />
              <ellipse cx="60" cy="60" rx="30" ry="19" fill="#080c16" />
              <path d="M 47 53 L 37 60 L 47 67" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
              <path d="M 64 49 L 56 71" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
              <path d="M 73 53 L 83 60 L 73 67" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
              <path d="M 104 42 C 120 62, 84 94, 34 98" stroke="url(#sgRing)" strokeWidth="6" strokeLinecap="round" />
            </svg>
            <span className="brand-title">
              <span className="text-white">Code</span>
              <span className="text-gradient">Sphere</span>
            </span>
          </div>

          <div className="hero-content">
            <h1 className="hero-heading">
              Build, Run &amp; Collaborate in the Cloud.
            </h1>
            <p className="hero-subtext">
              Sign in to access your React workspaces, instant code execution environment, and AI coding assistant.
            </p>

            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Code2 size={16} />
                </div>
                <span>React 19 &amp; Vite Hot-Reload Workspaces</span>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Zap size={16} />
                </div>
                <span>Sub-millisecond Serverless Execution</span>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Sparkles size={16} />
                </div>
                <span>Built-in CodeSphere AI Assistant</span>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Shield size={16} />
                </div>
                <span>End-to-End Local &amp; Cloud State Sync</span>
              </div>
            </div>
          </div>

          <div className="hero-footer">
            <span>© 2026 CodeSphere Inc. • Secure SSO OAuth 2.0</span>
          </div>
        </div>

        {/* RIGHT AUTH FORM PANEL */}
        <div className="signin-form-wrapper">
          <div className="form-header">
            <h2 className="form-title">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h2>
            <p className="form-subtitle">
              {isSignUp
                ? "Sign up to start building web applications"
                : "Sign in to access your workspaces & projects"}
            </p>
          </div>

          {/* SOCIAL SIGN IN BUTTONS */}
          <div className="social-auth-grid">
            {/* GOOGLE SIGN IN BUTTON */}
            <button
              type="button"
              className="btn-social btn-google"
              onClick={handleGoogleSignIn}
              disabled={loadingProvider !== null}
            >
              {loadingProvider === "google" ? (
                <>
                  <Loader2 className="spin-loader" size={18} />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Google SVG Logo */}
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            {/* GITHUB SIGN IN BUTTON */}
            <button
              type="button"
              className="btn-social btn-github"
              onClick={handleGitHubSignIn}
              disabled={loadingProvider !== null}
            >
              {loadingProvider === "github" ? (
                <>
                  <Loader2 className="spin-loader" size={18} />
                  <span>Connecting to GitHub...</span>
                </>
              ) : (
                <>
                  {/* GitHub SVG Logo */}
                  <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>Sign in with GitHub</span>
                </>
              )}
            </button>
          </div>

          <div className="auth-divider">
            <span className="divider-line"></span>
            <span className="divider-text">Or continue with email</span>
            <span className="divider-line"></span>
          </div>

          {/* EMAIL & PASSWORD FORM */}
          <form className="auth-form" onSubmit={handleEmailSubmit}>
            {isSignUp && (
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-field-wrapper">
                  <User size={16} className="input-field-icon" />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-field-wrapper">
                <Mail size={16} className="input-field-icon" />
                <input
                  type="email"
                  className="input-field"
                  placeholder="name@codesphere.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-field-wrapper">
                <Lock size={16} className="input-field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="error-banner">
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-submit-auth"
              disabled={loadingProvider !== null}
            >
              {loadingProvider === "email" ? (
                <>
                  <Loader2 className="spin-loader" size={18} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Sign In to CodeSphere"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* MODE TOGGLE & GUEST OPTION */}
          <div className="form-footer">
            <div className="auth-mode-toggle">
              <span>
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
              </span>
              <button
                type="button"
                className="toggle-link"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMessage("");
                }}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>

            <button
              type="button"
              className="btn-guest-login"
              onClick={onGuestContinue}
            >
              <span>Explore as Guest</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* GOOGLE SIGN IN CONFIRMATION MODAL */}
      {activeModal === "google" && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-content input-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <h3>Sign in with Google</h3>
              </div>
              <button className="close-modal" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="confirm-modal-text">
                Confirm your Google account to authorize CodeSphere:
              </p>
              <div className="input-group">
                <label>Gmail Address</label>
                <input
                  type="email"
                  className="custom-modal-input"
                  value={customGmail}
                  onChange={(e) => setCustomGmail(e.target.value)}
                  placeholder="adarshmohit9334@gmail.com"
                />
              </div>
              <div className="modal-footer-btns">
                <button className="btn-modal-cancel" onClick={() => setActiveModal(null)}>Cancel</button>
                <button className="btn-modal-submit" onClick={() => executeGoogleSignIn(customGmail)}>
                  Continue to CodeSphere
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GITHUB SIGN IN CONFIRMATION MODAL */}
      {activeModal === "github" && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-content input-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg className="social-icon" fill="#fff" viewBox="0 0 24 24" width="20" height="20">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <h3>Sign in with GitHub</h3>
              </div>
              <button className="close-modal" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="confirm-modal-text">
                Authorizing CodeSphere via GitHub OAuth:
              </p>
              <div className="input-group">
                <label>GitHub Username</label>
                <input
                  type="text"
                  className="custom-modal-input"
                  value={customGithub}
                  onChange={(e) => setCustomGithub(e.target.value)}
                  placeholder="adarshmohit9334"
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                <img
                  src={`https://github.com/${customGithub || "adarshmohit9334"}.png`}
                  alt="GitHub Avatar"
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #38bdf8" }}
                  onError={(e) => { e.target.src = "https://github.com/github.png"; }}
                />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Profile avatar will be loaded from <code>https://github.com/{customGithub}.png</code>
                </span>
              </div>
              <div className="modal-footer-btns">
                <button className="btn-modal-cancel" onClick={() => setActiveModal(null)}>Cancel</button>
                <button className="btn-modal-submit" onClick={() => executeGitHubSignIn(customGithub)}>
                  Authorize &amp; Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignIn;
