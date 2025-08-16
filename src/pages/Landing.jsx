// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import fullLogo from "../assets/company-logo.png";
import heroMock from "../assets/hero.png";
import notifyMock from "../assets/notify.png";

function Landing() {
  const navigate = useNavigate();

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    const data = new FormData(form);
    const name = encodeURIComponent(data.get("name") || "");
    const email = encodeURIComponent(data.get("email") || "");
    const msg = encodeURIComponent(data.get("message") || "");
    const subject = encodeURIComponent("Landing Contact - Task Hub");
    const body = `Name: ${name}%0AEmail: ${email}%0A%0A${msg}`;
    window.location.href = `mailto:hello@task-hub.app?subject=${subject}&body=${body}`;
  };

  return (
    <div>
      {/* Header */}
      <header className="navbar navbar-expand-lg custom-navbar border-bottom shadow-sm sticky-top px-3 py-2">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Logo */}
          <a className="navbar-brand d-flex align-items-center gap-2" href="#">
            <img
              src={fullLogo}
              alt="Task Hub logo"
              style={{ width: "auto", height: "40px" }}
            />
          </a>

          {/* Actions */}
          <nav className="d-flex gap-2">
            <button className="btn" onClick={() => navigate("/login")}>
              Log in
            </button>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/register")}
            >
              Create account{" "}
              <i className="bi bi-arrow-right ms-1" aria-hidden />
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section container py-5">
        <div className="row align-items-center g-4">
          {/* Text column */}
          <div className="col-lg-6 d-grid gap-3">
            <h1 className="fw-bold">
              Coordinate teams and tasks{" "}
              <span className="text-primary">clearly</span>.
            </h1>

            <p className="hero-subtitle mb-1">
              Public and personal tasks, member-level metrics, role-based
              permissions, and a clean workflow so nothing gets lost.
            </p>
            <small className="text-muted">
              Fast, simple, and built for focus.
            </small>

            <div className="d-flex flex-wrap gap-2 mt-2">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/register")}
              >
                Get started for free
              </button>
              <button className="btn" onClick={() => navigate("/login")}>
                I already have an account
              </button>
            </div>
          </div>

          {/* Mockup column */}
          <div className="col-lg-6 text-center">
            <div className="hero-mock-frame">
              <img
                src={heroMock}
                alt="Task Hub dashboard preview"
                className="img-fluid"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="stats-strip d-flex flex-wrap justify-content-center align-items-center py-1 px-3 text-center gap-5">
        <div className="strip-item">
          <span className="kpi">+50%</span>
          <span className="kpi-label">more tasks completed on time</span>
        </div>
        <div className="strip-divider d-none d-md-block" />
        <div className="strip-item">
          <span className="kpi">-35%</span>
          <span className="kpi-label">less confusion across teams</span>
        </div>
        <div className="strip-divider d-none d-md-block" />
        <div className="strip-item">
          <span className="kpi">24/7</span>
          <span className="kpi-label">cloud-based availability</span>
        </div>
      </section>

      {/* Features */}
      <section className="features-section container py-5">
        <div className="row gy-4">
          {[1, 2, 3].map((n) => {
            const data = [
              {
                title: "Public & Personal Tasks",
                color: "orange",
                kpi: "Stay Focused",
                text: "Collaborate on assigned team work and manage personal tasks at your own pace—all in one place.",
              },
              {
                title: "Member Statistics",
                color: "teal",
                kpi: "Visual Progress",
                text: "See pending, completed, and missed tasks per member to spot bottlenecks quickly.",
              },
              {
                title: "Roles & Permissions",
                color: "yellow",
                kpi: "Admin Control",
                text: "Admins manage everything; members update only their assigned tasks—nothing more, nothing less.",
              },
            ][n - 1];

            return (
              <div className="col-md-4" key={n}>
                <div className="feature-card p-4 rounded-5 shadow-sm d-flex flex-column justify-content-between h-100">
                  {/* Header */}
                  <div className="w-100 d-flex justify-content-start align-items-end gap-2 mb-3">
                    <div className="feature-number">
                      <div
                        className={`number-box text-white fw-bold bg-${data.color}`}
                      >
                        {n}
                      </div>
                    </div>
                    <h4
                      className={`feature-title text-uppercase text-${data.color} fw-bold mb-0`}
                    >
                      {data.title}
                    </h4>
                  </div>

                  {/* Text */}
                  <div>
                    <p className="mb-0">
                      <strong>{data.kpi}:</strong> {data.text}
                    </p>
                    <div
                      className={`feature-underline mt-3 mx-auto p-2 w-25 bg-${data.color} rounded-pill`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Showcase */}
      <section className="container py-5 containerAdjust">
        <div className="row align-items-center">
          {/* Image left */}
          <div className="col-md-6 mb-4 mb-md-0">
            <img
              src={notifyMock}
              alt="Clean dashboard preview"
              className="img-fluid rounded shadow-sm"
              style={{ maxHeight: "420px", objectFit: "cover" }}
              loading="lazy"
            />
          </div>

          {/* Text right */}
          <div className="col-md-6">
            <h2 className="mb-4 title">Clarity That Drives Action</h2>
            <p className="mb-0">
              Clear dates and simple statements. Deadlines, meetings, and
              milestones appear in an easy-to-read timeline so everyone knows
              exactly what’s next.
              <br />
              <br />
              No fluff—just the important stuff. Tasks and updates focus on what
              matters, cutting the noise so your team moves faster.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white text-center py-5">
        <div className="container">
          <h3 className="mb-2">Ready to get started?</h3>
          <p className="mb-4">Create your workspace in 30 seconds.</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button
              className="btn btn-light fw-bold"
              onClick={() => navigate("/register")}
            >
              Create account
            </button>
            <button
              className="btn btn-outline-light"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          </div>
        </div>
      </section>

      {/* Contact & Support */}
      <section className="container py-5">
        <div className="row g-4">
          {/* Contact */}
          <div className="col-md-6">
            <h2>Contact</h2>
            <p>Questions, feedback, or support? Write to us.</p>

            <form
              onSubmit={handleContactSubmit}
              className="row g-3 needs-validation mt-1"
              noValidate
            >
              <div className="col-12">
                <div className="form-floating">
                  <input
                    type="text"
                    name="name"
                    id="contactName"
                    className="form-control"
                    placeholder="Your name"
                    required
                    minLength={2}
                  />
                  <label htmlFor="contactName">Your name</label>
                  <div className="invalid-feedback">
                    Please enter your name.
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="form-floating">
                  <input
                    type="email"
                    name="email"
                    id="contactEmail"
                    className="form-control"
                    placeholder="name@example.com"
                    required
                  />
                  <label htmlFor="contactEmail">Your email</label>
                  <div className="invalid-feedback">
                    Please enter a valid email.
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="form-floating">
                  <textarea
                    name="message"
                    id="contactMsg"
                    className="form-control"
                    placeholder="How can we help?"
                    rows="4"
                    style={{ height: "140px" }}
                  />
                  <label htmlFor="contactMsg">How can we help?</label>
                </div>
              </div>

              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  Send
                </button>
                <a
                  href="mailto:hello@task-hub.app"
                  className="btn btn-outline-secondary"
                >
                  Email us directly
                </a>
              </div>
            </form>
          </div>

          {/* Support */}
          <div className="col-md-6">
            <h2>Support the Project</h2>
            <p>
              If Task-Hub helps your team, you can support future development.
            </p>
            <div className="d-flex gap-3 flex-wrap mb-3">
              <a
                href="https://www.buymeacoffee.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-warning fw-bold"
              >
                Buy Me a Coffee
              </a>
              <a
                href="https://paypal.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-secondary fw-bold"
              >
                PayPal
              </a>
            </div>
            <div className="border rounded p-3 itemBackground d-flex gap-2 align-items-center">
              <span className="fw-semibold">Spread the word:</span>
              <span className="text-muted">
                Share Task-Hub with your team—it helps a lot.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-light border-top py-3 mt-4">
        <div className="container d-flex justify-content-between flex-wrap align-items-center">
          <span className="text-muted">
            © {new Date().getFullYear()} Task-Hub
          </span>
          <div className="d-flex gap-3">
            <a href="#" className="text-decoration-none text-secondary">
              Terms
            </a>
            <a href="#" className="text-decoration-none text-secondary">
              Privacy
            </a>
            <a href="#" className="text-decoration-none text-secondary">
              Status
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
