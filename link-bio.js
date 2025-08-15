// Link-in-bio behavior using localStorage session (no CSS changes)
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  function svgInitial(letter) {
    return (
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
           <rect width="100%" height="100%" rx="60" ry="60" fill="#e5e7eb"/>
           <text x="50%" y="54%" font-family="Inter,Arial" font-size="44" text-anchor="middle" fill="#6b7280">${letter}</text>
         </svg>`
      )
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    const session = JSON.parse(localStorage.getItem("nxt_session") || "null");
    if (!session) {
      alert("Please log in or sign up first.");
      location.href = new URL("index.html", location.href).toString();
      return;
    }

    // Dynamic username in header
    const nameEl =
      document.getElementById("profile-username") ||
      document.querySelector(".username");
    if (nameEl) nameEl.textContent = "@" + session.username;

    // Avatar upload
    const picContainer = document.querySelector(".profile-picture-container");
    const uploadInput = document.getElementById("upload-input");
    const img = document.getElementById("profile-pic");
    const key = "nxt_profile_" + session.username;
    const profile = JSON.parse(
      localStorage.getItem(key) || '{"avatar":"","links":[]}'
    );

    if (img) {
      img.src = profile.avatar || svgInitial(session.username[0].toUpperCase());
    }

    if (picContainer && uploadInput) {
      picContainer.addEventListener("click", () => uploadInput.click());
      picContainer.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          uploadInput.click();
        }
      });
      uploadInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          profile.avatar = String(reader.result);
          if (img) img.src = profile.avatar;
          localStorage.setItem(key, JSON.stringify(profile));
        };
        reader.readAsDataURL(file);
      });
    }

    // Links add/render
    const container = document.getElementById("links-container");
    function render() {
      if (!container) return;
      container.querySelectorAll(".__wrap").forEach((n) => n.remove());
      (profile.links || []).forEach((l, i) => {
        const wrap = document.createElement("div");
        wrap.className = "__wrap";

        const a = document.createElement("a");
        a.className = "bio-link";
        a.href = l.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = l.name;

        const rm = document.createElement("button");
        rm.textContent = "×";
        rm.style.float = "right";
        rm.style.border = "0";
        rm.style.background = "transparent";
        rm.style.fontWeight = "700";
        rm.style.fontSize = "1rem";
        rm.setAttribute("aria-label", "Remove link");
        rm.addEventListener("click", (ev) => {
          ev.preventDefault();
          profile.links.splice(i, 1);
          localStorage.setItem(key, JSON.stringify(profile));
          render();
        });

        wrap.appendChild(a);
        wrap.appendChild(rm);
        container.appendChild(wrap);
      });
    }
    render();

    const form = document.getElementById("add-link-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name =
          (document.getElementById("link-name")?.value || "").trim();
        let url =
          (document.getElementById("link-url")?.value || "").trim();

        if (!name || !url) {
          alert("Please fill in both the link name and the URL.");
          return;
        }
        // Auto-prefix scheme if missing
        if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
          url = "https://" + url;
        }

        profile.links = profile.links || [];
        profile.links.push({ name, url });
        localStorage.setItem(key, JSON.stringify(profile));
        document.getElementById("link-name").value = "";
        document.getElementById("link-url").value = "";
        render();
      });
    }
  });
})();
