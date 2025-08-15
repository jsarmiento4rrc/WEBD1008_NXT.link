// Core UI: modals + demo auth (no CSS changes)
// Username allows letters, numbers, dots, underscores, dashes; length 2–32
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function validateUsername(u) {
    return /^[a-z0-9._-]{2,32}$/i.test(u);
  }

  function openModal(el) {
    const modal = typeof el === "string" ? $(el) : el;
    if (!modal) return;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(el) {
    const modal = typeof el === "string" ? $(el) : el;
    if (!modal) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Build an absolute URL from a relative path (keeps current host/port/dir)
  function redirectTo(path) {
    location.href = new URL(path, location.href).toString();
  }

  function setMsg(el, txt, ok = false) {
    if (!el) return;
    el.textContent = txt;
    el.style.color = ok ? "green" : "crimson";
  }

  // Simple localStorage store (demo only)
  const store = {
    get users() {
      return JSON.parse(localStorage.getItem("nxt_users") || "[]");
    },
    set users(v) {
      localStorage.setItem("nxt_users", JSON.stringify(v));
    },
    saveUser(u) {
      const list = this.users;
      if (list.some((x) => x.username === u.username || x.email === u.email))
        return false;
      list.push(u);
      this.users = list;
      return true;
    },
    findByIdentifier(id) {
      id = (id || "").trim().toLowerCase();
      return this.users.find((u) => u.username === id || u.email === id);
    },
    set session(u) {
      localStorage.setItem("nxt_session", JSON.stringify(u));
    },
    get session() {
      try {
        return JSON.parse(localStorage.getItem("nxt_session"));
      } catch {
        return null;
      }
    },
    clearSession() {
      localStorage.removeItem("nxt_session");
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    // Hero claim form (optional)
    const claimForm = document.querySelector(".claim-form");
    if (claimForm) {
      claimForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = claimForm.querySelector("input");
        const username = (input?.value || "").trim();
        if (!validateUsername(username)) {
          alert(
            "Username must be 2–32 characters and use letters, numbers, dots (.), underscores (_), or dashes (-)."
          );
          return;
        }
        // Prefill sign-up username if modal exists
        const suUser = document.querySelector("#signup-modal #username");
        if (suUser) suUser.value = username.toLowerCase();
        openModal("#signup-modal");
      });
    }

    // Modal openers
    $$(".signup-trigger").forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        openModal("#signup-modal");
      })
    );
    const loginBtn = $("#login-btn");
    if (loginBtn)
      loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal("#login-modal");
      });

    // Cross-links inside modals (e.g., "Sign in" / "Sign up" links)
    $$("#signup-modal a, #login-modal a").forEach((a) => {
      const label = (a.textContent || "").toLowerCase();
      a.addEventListener("click", (e) => {
        if (label.includes("sign in")) {
          e.preventDefault();
          closeModal("#signup-modal");
          openModal("#login-modal");
        } else if (label.includes("sign up")) {
          e.preventDefault();
          closeModal("#login-modal");
          openModal("#signup-modal");
        }
      });
    });

    // Close handlers
    $$(".close-btn").forEach((btn) =>
      btn.addEventListener("click", () => closeModal(btn.closest(".modal")))
    );
    window.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      const content = e.target.closest(".modal-content");
      if (modal && !content) closeModal(modal);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") $$(".modal").forEach(closeModal);
    });

    // Sign-up form submit (inside #signup-modal)
    const suForm = document.querySelector("#signup-modal form");
    if (suForm) {
      const suMsg = document.createElement("p");
      suMsg.className = "form-msg";
      suForm.appendChild(suMsg);

      suForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = (document.getElementById("username")?.value || "")
          .trim()
          .toLowerCase();
        const email = (document.getElementById("email")?.value || "")
          .trim()
          .toLowerCase();
        const pass = document.getElementById("password")?.value || "";
        const confirm =
          document.getElementById("confirm-password")?.value || "";

        if (!validateUsername(username))
          return setMsg(
            suMsg,
            "Username must be 2–32 characters and use letters, numbers, dots (.), underscores (_), or dashes (-)."
          );
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
          return setMsg(suMsg, "Enter a valid email.");
        if (pass.length < 6)
          return setMsg(suMsg, "Password must be at least 6 characters.");
        if (pass !== confirm) return setMsg(suMsg, "Passwords do not match.");

        const ok = store.saveUser({ username, email, pass });
        if (!ok) return setMsg(suMsg, "Username or email already exists.");

        store.session = { username, email };
        setMsg(suMsg, "Account created! Redirecting…", true);
        setTimeout(() => {
          closeModal("#signup-modal");
          redirectTo("link-bio.html"); // absolute-URL redirect
        }, 600);
      });
    }

    // Login form submit (inside #login-modal)
    const liForm = document.querySelector("#login-modal form");
    if (liForm) {
      const liMsg = document.createElement("p");
      liMsg.className = "form-msg";
      liForm.appendChild(liMsg);

      liForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const idInput = liForm.querySelector('input[type="text"]');
        const pwInput = liForm.querySelector('input[type="password"]');
        const id = (idInput?.value || "").trim();
        const pass = pwInput?.value || "";
        const user = store.findByIdentifier(id);
        if (!user)
          return setMsg(liMsg, "No account found for that username/email.");
        if (user.pass !== pass) return setMsg(liMsg, "Incorrect password.");

        store.session = { username: user.username, email: user.email };
        setMsg(liMsg, "Logged in! Redirecting…", true);
        setTimeout(() => {
          closeModal("#login-modal");
          redirectTo("link-bio.html"); // absolute-URL redirect
        }, 500);
      });
    }
  });
})();
