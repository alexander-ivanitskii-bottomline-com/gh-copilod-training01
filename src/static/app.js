document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Helper to safely escape text for HTML
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Reset activity select to avoid duplicate options
      activitySelect.innerHTML = '<option value="" disabled selected>Select an activity</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants HTML (bulleted list) or fallback message
        const participantsHtml =
          details.participants && details.participants.length
            ? `<ul class="participants-list" style="margin:6px 0 0 16px;padding:0;">
                 ${details.participants.map(p => `<li style="margin:4px 0;">${escapeHtml(p)}</li>`).join("")}
               </ul>`
            : `<p class="no-participants" style="font-style:italic;color:#666;margin:6px 0 0;">No participants yet</p>`;

        activityCard.innerHTML = `
          <h4 style="margin:0 0 6px 0;">${escapeHtml(name)}</h4>
          <p style="margin:0 0 6px 0;color:#333;">${escapeHtml(details.description)}</p>
          <p style="margin:0 0 6px 0;"><strong>Schedule:</strong> ${escapeHtml(details.schedule)}</p>
          <p style="margin:0 0 8px 0;"><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section" style="border-top:1px solid #eee;padding-top:8px;">
            <h5 style="margin:0 0 6px 0;font-size:0.95em;color:#333;">Participants (${details.participants.length})</h5>
            ${participantsHtml}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
