const API_BASE = "http://localhost:3010";
const output = document.getElementById("output");

document.getElementById("login").addEventListener("click", () => {
  window.location.href = `${API_BASE}/auth/login`;
});

document.getElementById("me").addEventListener("click", async () => {
  try {
    const response = await fetch(`${API_BASE}/api/me`, {
      credentials: "include"
    });
    const payload = await response.json();
    output.textContent = JSON.stringify(payload, null, 2);
  } catch (error) {
    output.textContent = String(error);
  }
});
