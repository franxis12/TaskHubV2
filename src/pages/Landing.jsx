// src/pages/Landing.jsx
import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { tailwindClass } from "../importFiles/tailwindStyles";
import Button from "../Utils/Button";
import { SVGIcons, myImage } from "../importFiles/imports";

function Landing() {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const userName = useMemo(() => {
    const full = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    return full || (user?.email ?? "User");
  }, [user]);

  const roleBadgeClasses = useMemo(() => {
    const r = (user?.role || "").toLowerCase();
    const base =
      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";
    const palette = {
      admin: tailwindClass.accountType.admin,
      member: tailwindClass.accountType.member,
    };
    return `${base} ${
      palette[r] || "bg-slate-100 text-slate-700 border-slate-200"
    }`;
  }, [user?.role]);

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
    window.location.href = `mailto:hello@taskitin.app?subject=${subject}&body=${body}`;
  };

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b shadow-sm px-3 py-2 bg-[var(--componentsBG)]">
        <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 flex items-center justify-between">
          {/* Logo */}
          <a className="flex items-center gap-2" href="#">
            <img
              src={myImage.logoImage}
              alt="Taskitin logo"
              className="h-full"
            />
          </a>

          {/* Actions */}
          {!user ? (
            <nav className="flex gap-2">
              <Button color={"auto"} onClick={() => navigate("/login")}>
                Log in
              </Button>

              <Button color={"orange"} onClick={() => navigate("/register")}>
                Create account
              </Button>
            </nav>
          ) : (
            <div className="flex gap-2 px-2 items-center ">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-sm font-medium tx-color">{userName}</span>
                {user?.role && (
                  <span className={roleBadgeClasses}>{user.role}</span>
                )}
              </div>
              <img
                className="h-9 w-9 rounded-full object-cover border-2 ring-1 ring-slate-200"
                src={user?.photo || myImage.defaultUser}
                alt="Avatar"
              />
              <Button
                color={"auto"}
                icon={SVGIcons.login}
                position={"center"}
                onClick={() => navigate("/dashboard")}
                iconRight
              >
                <span className="hidden md:block">Go Dashboard</span>
              </Button>
              <Button
                color={"orange"}
                icon={SVGIcons.logout}
                position={"center"}
                onClick={logout}
                iconRight
              >
                <span className="hidden md:block">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-4 md:grid-cols-2 items-center">
          {/* Text column */}
          <div className="w-full grid gap-3">
            <h1 className="font-bold text-5xl">
              Coordinate teams and tasks{" "}
              <span className="text-orange">clearly</span>.
            </h1>

            <p className="hero-subtitle mb-1 text-slate-600">
              Public and personal tasks, member-level metrics, role-based
              permissions, and a clean workflow so nothing gets lost.
            </p>
            <small className="text-slate-500">
              Fast, simple, and built for focus.
            </small>

            <div className="flex flex-wrap gap-2 mt-2">
              <Button color={"orange"} onClick={() => navigate("/register")}>
                Get started for free
              </Button>
              <Button color={"auto"} onClick={() => navigate("/login")}>
                I already have an account
              </Button>
            </div>
          </div>

          {/* Mockup column */}
          <div className="w-full text-center">
            <div className="hero-mock-frame">
              <img
                src={myImage.heroMock}
                alt="Task Hub dashboard preview"
                className="max-w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="stats-strip flex flex-wrap justify-center items-center py-1 px-3 text-center gap-5">
        <div className="strip-item">
          <span className="text-orange text-3xl">+50%</span>
          <span>more tasks completed on time</span>
        </div>
        <div className="strip-divider hidden md:block" />
        <div className="strip-item">
          <span className="text-orange text-3xl">-35%</span>
          <span>less confusion across teams</span>
        </div>
        <div className="strip-divider hidden md:block" />
        <div className="strip-item">
          <span className="text-orange text-3xl">24/7</span>
          <span>cloud-based availability</span>
        </div>
      </section>

      {/* Features */}
      <section className="features-section mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-4 md:grid-cols-3">
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
              <div className="w-full" key={n}>
                <div className="feature-card p-4 rounded-2xl shadow-sm flex flex-col justify-between h-full">
                  {/* Header */}
                  <div className="w-full flex justify-start items-end gap-2 mb-3">
                    <div className="feature-number">
                      <div
                        className={`number-box text-white font-bold bg-${data.color}`}
                      >
                        {n}
                      </div>
                    </div>
                    <h4
                      className={`feature-title uppercase text-${data.color} font-bold mb-0`}
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
                      className={`feature-underline mt-3 mx-auto p-2 w-1/4 bg-${data.color} rounded-full`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 containerAdjust">
        <div className="grid gap-6 md:grid-cols-2 items-center">
          {/* Image left */}
          <div className="w-full mb-4 md:mb-0">
            <img
              src={myImage.notifyMock}
              alt="Clean dashboard preview"
              className="max-w-full h-auto rounded shadow-sm"
              style={{ maxHeight: "420px", objectFit: "cover" }}
              loading="lazy"
            />
          </div>

          {/* Text right */}
          <div className="w-full">
            <h2 className="mb-4 title text-xl font-medium">
              Clarity That Drives Action
            </h2>
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
      <section className="bg-[var(--orange)] text-white text-center py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="mb-2">Ready to get started?</h3>
          <p className="mb-4">Create your workspace in 30 seconds.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Button color={"autoInverse"} onClick={() => navigate("/register")}>
              Create account
            </Button>
            <Button color={"auto"} onClick={() => navigate("/login")}>
              Log in
            </Button>
          </div>
        </div>
      </section>

      {/* Contact & Support */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Contact */}
          <div className="col-md-6">
            <h2>Contact</h2>
            <p>Questions, feedback, or support? Write to us.</p>

            <form
              onSubmit={handleContactSubmit}
              className="grid gap-3 mt-1"
              noValidate
            >
              <div className="w-full">
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    name="name"
                    id="contactName"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                    placeholder="Your name"
                    required
                    minLength={2}
                  />
                  <label
                    htmlFor="contactName"
                    className="text-xs text-slate-500"
                  >
                    Your name
                  </label>
                  <div className="text-rose-600 text-xs mt-1">
                    Please enter your name.
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="flex flex-col gap-1">
                  <input
                    type="email"
                    name="email"
                    id="contactEmail"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                    placeholder="name@example.com"
                    required
                  />
                  <label
                    htmlFor="contactEmail"
                    className="text-xs text-slate-500"
                  >
                    Your email
                  </label>
                  <div className="text-rose-600 text-xs mt-1">
                    Please enter a valid email.
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="flex flex-col gap-1">
                  <textarea
                    name="message"
                    id="contactMsg"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                    placeholder="How can we help?"
                    rows="4"
                    style={{ height: "140px" }}
                  />
                  <label
                    htmlFor="contactMsg"
                    className="text-xs text-slate-500"
                  >
                    How can we help?
                  </label>
                </div>
              </div>

              <div className="w-full flex gap-2">
                <Button color={"orange"} type="submit">
                  Send
                </Button>
                <Button color={"auto"}>
                  {" "}
                  <a href="mailto:hello@taskitin.app">Email us directly</a>
                </Button>
              </div>
            </form>
          </div>

          {/* Support */}
          <div className="w-full">
            <h2>Support the Project</h2>
            <p>
              If Taskitin helps your team, you can support future development.
            </p>
            <div className="flex gap-3 flex-wrap mb-3">
              <Button color={"yellow"}>
                <a
                  href="https://www.buymeacoffee.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy Me a Coffee
                </a>
              </Button>
              <Button color={"green"}>
                <a
                  href="https://paypal.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PayPal
                </a>
              </Button>
            </div>
            <div className="border rounded p-3 itemBackground flex gap-2 items-center">
              <span className="font-semibold">Spread the word:</span>
              <span className="text-slate-500">
                Share Taskitin with your team—it helps a lot.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--componentsBG)] border-t py-3 mt-4">
        <div className="mx-auto max-w-7xl px-4 flex justify-between flex-wrap items-center">
          <span className="text-slate-500">
            © {new Date().getFullYear()} Taskitin
          </span>
          <div className="flex gap-3 items-center">
            <span className="border-r-1 px-3 flex items-center gap-1">
              Develop by{" "}
              <Button color={"neutro"}>
                <a className="text-[var(--textColor)] font-semibold hover:text-[var(--orange)]">
                  Francis Martinez
                </a>
              </Button>
              <Button color={"neutroIcon"} icon={SVGIcons.social.github}>
                <a href="https://github.com/franxis12"></a>
              </Button>
              <Button
                color={"neutroIcon"}
                icon={SVGIcons.social.linkedin}
                onClick={() =>
                  (window.location.href =
                    "https://www.linkedin.com/in/francis-martinez-07616723a/")
                }
              ></Button>
              <Button color={"neutroIcon"} icon={SVGIcons.social.xSocial}>
                <a href="https://x.com/FrancisMar98955"></a>
              </Button>
            </span>
            <Button color={"neutro"} onClick={() => navigate("/terms")}>
              <a
                href="#"
                className="no-underline text-slate-600 hover:text-slate-800"
              >
                Terms
              </a>
            </Button>
            <Button color={"neutro"} onClick={() => navigate("/privacy")}>
              <a
                href="#"
                className="no-underline text-slate-600 hover:text-slate-800"
              >
                Privacy
              </a>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
