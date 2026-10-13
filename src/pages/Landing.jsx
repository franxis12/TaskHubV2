import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import logo from "../assets/LOGO.svg";
import "../styles/landing.css";

function Icon({ name, className = "" }) {
  const paths = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v17h17M9 15v-4m5 4V7m5 8v-6" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };
  return (
    <svg
      className={`tl-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.check}
    </svg>
  );
}

const sampleTasks = {
  team: [
    {
      name: "Plan the product launch",
      project: "Marketing",
      initials: "JD",
      color: "peach",
      status: "In progress",
      priority: "High",
    },
    {
      name: "Review the homepage design",
      project: "Design",
      initials: "AL",
      color: "purple",
      status: "In progress",
      priority: "Medium",
    },
    {
      name: "Prepare the team handoff",
      project: "Operations",
      initials: "MK",
      color: "mint",
      status: "Pending",
      priority: "Medium",
    },
    {
      name: "Share the project brief",
      project: "Marketing",
      initials: "JD",
      color: "peach",
      status: "Completed",
      priority: "Low",
    },
  ],
  personal: [
    {
      name: "Outline ideas for next week",
      project: "Planning",
      initials: "YO",
      color: "mint",
      status: "In progress",
      priority: "Medium",
    },
    {
      name: "Read the design feedback",
      project: "Learning",
      initials: "YO",
      color: "mint",
      status: "Pending",
      priority: "High",
    },
    {
      name: "Organize project notes",
      project: "Personal",
      initials: "YO",
      color: "mint",
      status: "Completed",
      priority: "Low",
    },
    {
      name: "Prepare for the team meeting",
      project: "Planning",
      initials: "YO",
      color: "mint",
      status: "Pending",
      priority: "Medium",
    },
  ],
};

function WorkspacePreview() {
  const [view, setView] = useState("team");
  return (
    <div className="tl-preview-scene" id="workspace">
      <div className="tl-preview-orbit" aria-hidden="true" />
      <div className="tl-preview">
        <div className="tl-window-bar">
          <span className="tl-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>your workspace, simplified</span>
          <Icon name="lock" />
        </div>
        <div className="tl-app-shell">
          <aside className="tl-preview-sidebar" aria-hidden="true">
            <img src={logo} alt="" />
            <span className="tl-side-active">
              <Icon name="grid" />
            </span>
            <Icon name="users" />
            <Icon name="chart" />
            <Icon name="calendar" />
            <span className="tl-side-avatar">JD</span>
          </aside>
          <div className="tl-preview-main">
            <div className="tl-preview-top">
              <span>
                <span className="tl-workspace-square">S</span> Studio workspace{" "}
                <Icon name="chevron" />
              </span>
              <span className="tl-demo-label">DEMO</span>
            </div>
            <div className="tl-preview-greeting">
              <div>
                <h2>A little focus. A lot of progress.</h2>
                <p>Let’s make room for your best work.</p>
              </div>
              <span className="tl-sun">
                <Icon name="sun" />
              </span>
            </div>
            <div className="tl-mini-stats">
              <div>
                <span className="tl-stat-icon orange">
                  <Icon name="clock" />
                </span>
                <span>
                  <small>Pending</small>
                  <strong>{view === "team" ? "08" : "02"}</strong>
                </span>
              </div>
              <div>
                <span className="tl-stat-icon blue">
                  <Icon name="chart" />
                </span>
                <span>
                  <small>In progress</small>
                  <strong>{view === "team" ? "04" : "01"}</strong>
                </span>
              </div>
              <div>
                <span className="tl-stat-icon green">
                  <Icon name="check" />
                </span>
                <span>
                  <small>Completed</small>
                  <strong>{view === "team" ? "12" : "01"}</strong>
                </span>
              </div>
            </div>
            <div
              className="tl-preview-tabs"
              role="group"
              aria-label="Preview task type"
            >
              <button
                type="button"
                className={view === "team" ? "is-active" : ""}
                aria-pressed={view === "team"}
                onClick={() => setView("team")}
              >
                <Icon name="users" />
                Team tasks
              </button>
              <button
                type="button"
                className={view === "personal" ? "is-active" : ""}
                aria-pressed={view === "personal"}
                onClick={() => setView("personal")}
              >
                <Icon name="lock" />
                Personal tasks
              </button>
            </div>
            <div
              className="tl-task-list"
              aria-live="polite"
              aria-label={`${view === "team" ? "Team" : "Personal"} sample tasks`}
            >
              <div className="tl-task-table-head">
                <span>Task name</span>
                <span>Priority</span>
                <span>Status</span>
              </div>
              {sampleTasks[view].map((task) => (
                <div className="tl-task-row" key={task.name}>
                  <span
                    className={`tl-task-checkbox ${task.status === "Completed" ? "is-done" : ""}`}
                    aria-hidden="true"
                  >
                    {task.status === "Completed" && <Icon name="check" />}
                  </span>
                  <div className="tl-task-name">
                    <strong>{task.name}</strong>
                    <small>{task.project}</small>
                  </div>
                  <span
                    className={`tl-priority ${task.priority.toLowerCase()}`}
                  >
                    <i />
                    {task.priority}
                  </span>
                  <span
                    className={`tl-task-status ${task.status.toLowerCase().replace(" ", "-")}`}
                  >
                    {task.status}
                  </span>
                  <span className={`tl-avatar ${task.color}`}>
                    {task.initials}
                  </span>
                </div>
              ))}
            </div>
            <p className="tl-preview-bottom">
              <span>
                <span className="tl-online-dot" /> A place for every task.
              </span>
              <span>Sample workspace</span>
            </p>
          </div>
        </div>
      </div>
      <div className="tl-floating-note">
        <span className="tl-note-check">
          <Icon name="check" />
        </span>
        <span>
          <strong>Big plans. Small steps.</strong>
          <small>That’s how great work gets done.</small>
        </span>
        <span className="tl-note-spark" aria-hidden="true">
          ✦
        </span>
      </div>
      <p className="tl-preview-caption">
        A glimpse of a calmer workday. Try the tabs above.
      </p>
    </div>
  );
}

function Landing() {
  const { user, logout } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState("");
  const [accountError, setAccountError] = useState("");
  const userName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.email ||
    "Your account";
  const destination = user ? "/dashboard" : "/register";
  const actionLabel = user ? "Go to your dashboard" : "Get started for free";

  function handleContactSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent("Taskitin — Contact & feedback");
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`,
    );
    window.location.href = `mailto:hello@taskitin.app?subject=${subject}&body=${body}`;
    setContactStatus(
      "Your email app will open with your message. Send it there when you’re ready.",
    );
  }

  async function handleLogout() {
    try {
      await logout();
      setAccountError("");
    } catch {
      setAccountError("We couldn’t sign you out. Please try again.");
    }
  }

  return (
    <div className="taskitin-landing" id="top">
      <a href="#main-content" className="tl-skip-link">
        Skip to content
      </a>
      <header className="tl-header">
        <div className="tl-container tl-nav">
          <a className="tl-brand" href="#top" aria-label="Taskitin home">
            <img src={logo} alt="" />
            <span>
              taskitin<span className="tl-brand-period">.</span>
            </span>
          </a>
          <nav
            className={`tl-nav-links ${menuOpen ? "is-open" : ""}`}
            id="landing-navigation"
            aria-label="Main navigation"
          >
            <a href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>
              FAQs
            </a>
          </nav>
          <div className="tl-nav-actions">
            {user ? (
              <>
                <span className="tl-user-name" title={userName}>
                  {userName}
                  <small>{user.role}</small>
                </span>
                <button
                  className="tl-login"
                  type="button"
                  onClick={handleLogout}
                >
                  Log out
                </button>
                <Link className="tl-button tl-button-small" to="/dashboard">
                  Dashboard <Icon name="arrow" />
                </Link>
              </>
            ) : (
              <>
                <Link className="tl-login" to="/login">
                  Log in
                </Link>
                <Link className="tl-button tl-button-small" to="/register">
                  Get started <Icon name="arrow" />
                </Link>
              </>
            )}
            <button
              className="tl-menu-button"
              type="button"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="landing-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>
        {accountError && (
          <p className="tl-account-error" role="alert">
            {accountError}
          </p>
        )}
      </header>
      <main id="main-content">
        <section className="tl-hero">
          <div className="tl-container tl-hero-grid">
            <div className="tl-hero-copy">
              <p className="tl-eyebrow">
                <span className="tl-online-dot" /> LESS CHAOS. MORE CLARITY.
              </p>
              <h1>
                Great work.
                <br />
                Clear minds.
                <br />
                <span>One place.</span>
                <svg
                  className="tl-hero-underline"
                  viewBox="0 0 340 17"
                  aria-hidden="true"
                >
                  <path d="M3 12Q165-4 337 9M27 16Q170 4 300 13" />
                </svg>
              </h1>
              <p className="tl-hero-description">
                Bring your team, tasks, and next big ideas together. A simpler
                way to stay organized and move work forward.
              </p>
              <div className="tl-hero-actions">
                <Link className="tl-button" to={destination}>
                  {actionLabel}
                  <Icon name="arrow" />
                </Link>
                <a className="tl-explore-link" href="#features">
                  Take a closer look <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="tl-hero-reassurance">
                <span>
                  <Icon name="check" /> Free to get started
                </span>
                <span>
                  <Icon name="check" /> Built for focus
                </span>
              </div>
            </div>
            <WorkspacePreview />
          </div>
          <div className="tl-container tl-value-strip">
            <p>
              Less managing work.
              <br />
              <strong>More making it happen.</strong>
            </p>
            <span>
              <Icon name="users" /> Team & personal tasks
            </span>
            <span>
              <Icon name="chart" /> Progress at a glance
            </span>
            <span>
              <Icon name="lock" /> Clear roles & permissions
            </span>
          </div>
        </section>

        <section className="tl-container tl-features tl-section" id="features">
          <div className="tl-section-heading">
            <div>
              <p className="tl-eyebrow">ROOM TO FOCUS</p>
              <h2>
                Everything you need.
                <br />
                <span>Nothing in your way.</span>
              </h2>
            </div>
            <p>
              A shared view of what matters, with enough
              <br className="tl-desktop-break" /> space for everyone to do their
              best work.
            </p>
          </div>
          <div className="tl-feature-grid">
            <article className="tl-feature-card">
              <div
                className="tl-feature-visual tl-visual-tasks"
                aria-hidden="true"
              >
                <div className="tl-little-task">
                  <span className="tl-little-check">
                    <Icon name="check" />
                  </span>{" "}
                  The team’s next big idea{" "}
                  <span className="tl-avatar purple">AL</span>
                </div>
                <div className="tl-little-task">
                  <span className="tl-little-check" /> Your own to-do list{" "}
                  <Icon name="lock" />
                </div>
                <span className="tl-visual-label">
                  <i /> Separate spaces. Shared momentum.
                </span>
              </div>
              <div className="tl-feature-copy">
                <span className="tl-feature-index">01 / ORGANIZE</span>
                <h3>
                  Your tasks. Your team’s.
                  <br />
                  Together, with boundaries.
                </h3>
                <p>
                  Collaborate on company tasks and keep personal to-dos private.
                  Break bigger work into manageable subtasks.
                </p>
              </div>
            </article>
            <article className="tl-feature-card">
              <div
                className="tl-feature-visual tl-visual-progress"
                aria-hidden="true"
              >
                <div className="tl-progress-summary">
                  <span>Every step counts</span>
                  <span className="tl-progress-label">
                    Steady progress <Icon name="chart" />
                  </span>
                </div>
                <div className="tl-chart-bars">
                  {[32, 49, 41, 68, 57, 82, 96].map((height, index) => (
                    <div key={index}>
                      <i style={{ height: `${height}%` }} />
                      <span>{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="tl-feature-copy">
                <span className="tl-feature-index">
                  02 / SEE THE BIG PICTURE
                </span>
                <h3>
                  Less “where are we?”
                  <br />
                  More “look how far.”
                </h3>
                <p>
                  See pending, in-progress, completed, and missed tasks.
                  Understand each member’s workload at a glance.
                </p>
              </div>
            </article>
            <article className="tl-feature-card">
              <div
                className="tl-feature-visual tl-visual-roles"
                aria-hidden="true"
              >
                <div className="tl-member-row">
                  <span className="tl-avatar peach">JD</span>
                  <div>
                    Jamie Davis<small>Keeping the team in sync</small>
                  </div>
                  <span className="tl-role">Admin</span>
                </div>
                <div className="tl-member-row">
                  <span className="tl-avatar purple">AL</span>
                  <div>
                    Alex Lee<small>Making great things happen</small>
                  </div>
                  <span className="tl-role member">Member</span>
                </div>
                <span className="tl-role-note">
                  <Icon name="lock" /> The right access for the right people.
                </span>
              </div>
              <div className="tl-feature-copy">
                <span className="tl-feature-index">03 / WORK TOGETHER</span>
                <h3>
                  A place for everyone.
                  <br />A role that makes sense.
                </h3>
                <p>
                  Admins organize the workspace and approve members. Team
                  members focus on their assigned work and personal tasks.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="tl-process-section" id="how-it-works">
          <div className="tl-container tl-section">
            <div className="tl-centered-heading">
              <p className="tl-eyebrow">FROM TO-DO TO TA-DA</p>
              <h2>
                A little setup.
                <br />A whole lot of possibility.
              </h2>
              <p>Go from scattered tasks to a shared plan.</p>
            </div>
            <div className="tl-process-grid">
              {[
                {
                  title: "Make yourself at home",
                  text: "Create an account and set up your company, or join an existing team with its company ID.",
                  icon: "grid",
                },
                {
                  title: "Give every task a place",
                  text: "Add tasks, set priorities and due dates, and turn bigger projects into smaller, clear steps.",
                  icon: "calendar",
                },
                {
                  title: "Move forward, together",
                  text: "Update your progress, keep an eye on deadlines, and see what your team has accomplished.",
                  icon: "check",
                },
              ].map((step, index) => (
                <article key={step.title}>
                  <div className="tl-process-top">
                    <span className="tl-process-icon">
                      <Icon name={step.icon} />
                    </span>
                    <span className="tl-process-number">0{index + 1}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="tl-container tl-faq tl-section" id="faq">
          <div>
            <p className="tl-eyebrow">GOOD QUESTIONS</p>
            <h2>
              A little clarity,
              <br />
              before you start.
            </h2>
            <p>
              Still curious about something?
              <br />
              <a href="#contact">
                Let’s talk <Icon name="arrow" />
              </a>
            </p>
          </div>
          <div className="tl-faq-list">
            {[
              {
                question: "Can I use Taskitin for my own tasks?",
                answer:
                  "Yes. Your workspace includes personal tasks that are visible only to you. Keep your own to-dos organized alongside your company’s work.",
              },
              {
                question: "How does my team join the workspace?",
                answer:
                  "An admin creates the company workspace. Members register with the same company ID and wait for the admin to approve their access.",
              },
              {
                question: "What’s the difference between admins and members?",
                answer:
                  "Admins manage company tasks and member approvals. Members work on tasks assigned to them and can create and manage their own personal tasks.",
              },
              {
                question: "Can I break a task into smaller steps?",
                answer:
                  "Yes. A task can include up to 10 subtasks. Complete each subtask before marking the overall task as completed.",
              },
            ].map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <Icon name="plus" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="tl-container">
          <div className="tl-final-cta">
            <div className="tl-cta-decoration" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div>
              <p className="tl-eyebrow">MAKE SPACE FOR WHAT MATTERS</p>
              <h2>
                Your next great idea
                <br />
                deserves a clear plan.
              </h2>
              <p>Less scattered. More connected. Start with Taskitin.</p>
            </div>
            <div className="tl-final-action">
              <Link className="tl-button tl-button-coral" to={destination}>
                {actionLabel}
                <Icon name="arrow" />
              </Link>
              <span>Your team’s next chapter starts here.</span>
            </div>
          </div>
        </section>

        <section className="tl-container tl-contact tl-section" id="contact">
          <div>
            <p className="tl-eyebrow">LET’S KEEP THE CONVERSATION GOING</p>
            <h2>
              Built with care.
              <br />
              Better with your feedback.
            </h2>
            <p>Have a question or an idea? We’d love to hear it.</p>
            <a className="tl-contact-email" href="mailto:hello@taskitin.app">
              <Icon name="mail" />
              hello@taskitin.app <span aria-hidden="true">↗</span>
            </a>
            <a
              className="tl-source-link"
              href="https://github.com/franxis12/TaskHubV2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore the project on GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
          <form className="tl-contact-form" onSubmit={handleContactSubmit}>
            <div className="tl-form-row">
              <label htmlFor="contactName">
                Your name
                <input
                  id="contactName"
                  name="name"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  required
                  minLength={2}
                />
              </label>
              <label htmlFor="contactEmail">
                Email address
                <input
                  id="contactEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="alex@company.com"
                  required
                />
              </label>
            </div>
            <label htmlFor="contactMsg">
              What’s on your mind?
              <textarea
                id="contactMsg"
                name="message"
                placeholder="An idea, a question, or a little feedback…"
                rows={4}
                required
              />
            </label>
            <div className="tl-form-submit">
              <span>Opens in your email app.</span>
              <button className="tl-button tl-button-small" type="submit">
                Let’s talk <Icon name="arrow" />
              </button>
            </div>
            <p className="tl-contact-status" role="status">
              {contactStatus}
            </p>
          </form>
        </section>
      </main>
      <footer className="tl-footer">
        <div className="tl-container">
          <div className="tl-footer-top">
            <a className="tl-brand" href="#top" aria-label="Taskitin home">
              <img src={logo} alt="" />
              <span>
                taskitin<span className="tl-brand-period">.</span>
              </span>
            </a>
            <p>A calmer way to get there, together.</p>
            <nav aria-label="Footer navigation">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <a
                href="https://github.com/franxis12/TaskHubV2"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </nav>
          </div>
          <div className="tl-footer-bottom">
            <span>
              © {new Date().getFullYear()} Taskitin. Made for making progress.
            </span>
            <span>
              Designed & built by{" "}
              <a
                href="https://github.com/franxis12"
                target="_blank"
                rel="noopener noreferrer"
              >
                Francis Martinez <span aria-hidden="true">↗</span>
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
