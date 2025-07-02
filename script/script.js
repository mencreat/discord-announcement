
    const webhookUrl = "https://discord.com/api/webhooks/1389964033402343514/4XMsH7w1eZm4rlyYM_vrrkZohJHpfEBSJDL1geo-QgU5PUDoctH-Kfb7pujFn16baU7A"; // Ganti ini dengan webhook kamu

    const form = document.getElementById("discordForm");
    const status = document.getElementById("status");
    const colorPicker = document.getElementById("colorPicker");
    const fieldsContainer = document.getElementById("fieldsContainer");
    const addFieldBtn = document.getElementById("addFieldBtn");

    // Template color selection
    document.querySelectorAll(".template-color").forEach(el => {
      el.addEventListener("click", () => {
        document.querySelectorAll(".template-color").forEach(e => e.classList.remove("selected"));
        el.classList.add("selected");
        colorPicker.value = el.dataset.color;
        updatePreview();
      });
    });

    // Update preview
    function updatePreview() {
      const embed = document.getElementById("embed");
      embed.style.borderLeftColor = colorPicker.value;
    }

    // Add new field form dynamically
    addFieldBtn.addEventListener("click", () => {
      const fieldDiv = document.createElement("div");
      fieldDiv.classList.add("field-item");

      fieldDiv.innerHTML = `
        <div class="field-inputs">
            <input type="text" class="field-name" placeholder="Field Name" />
            <input type="text" class="field-value" placeholder="Field Value" />
            <label class="field-inline-label">Inline Field
              <input type="checkbox" class="field-inline" />
            </label>
        </div>
        <button type="button" class="remove-field" title="Remove field">&times;</button>
      `;

      fieldsContainer.appendChild(fieldDiv);

      // Remove field handler
      fieldDiv.querySelector(".remove-field").addEventListener("click", () => {
        fieldsContainer.removeChild(fieldDiv);
      });
    });

    // Attach updatePreview on inputs
    form.querySelectorAll("input, textarea").forEach(el => el.addEventListener("input", updatePreview));
    updatePreview();

    form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Definisikan fungsi clean dulu di sini
  function clean(obj) {
    if (typeof obj !== "object" || obj === null) return obj;
    for (const key in obj) {
      if (obj[key] === undefined || obj[key] === "") delete obj[key];
      else if (typeof obj[key] === "object") clean(obj[key]);
    }
    return obj;
  }

  // Lanjutkan proses form di bawah
  const fieldItems = document.querySelectorAll("#fieldsContainer .field-item");
  const fields = [];
  fieldItems.forEach(div => {
    const name = div.querySelector(".field-name").value.trim();
    const value = div.querySelector(".field-value").value.trim();
    const inline = div.querySelector(".field-inline").checked;

    if(name && value) {
      fields.push({ name, value, inline });
    }
  });

  const embed = {
    title: document.getElementById("embedTitle").value || undefined,
    description: document.getElementById("embedDescription").value || undefined,
    color: parseInt(colorPicker.value.replace("#", ""), 16) || undefined,
    author: {
      name: document.getElementById("authorName").value || undefined,
      icon_url: document.getElementById("authorIcon").value || undefined
    },
    fields: fields.length > 0 ? fields : undefined,
    thumbnail: {
      url: document.getElementById("thumbnail").value || undefined
    },
    image: {
      url: document.getElementById("image").value || undefined
    },
    timestamp: new Date().toISOString()
  };

  clean(embed);

  function isEmbedEmpty(embed) {
    if (embed.title) return false;
    if (embed.description) return false;
    if (embed.fields && embed.fields.length > 0) return false;
    if (embed.author && embed.author.name) return false;
    if (embed.thumbnail && embed.thumbnail.url) return false;
    if (embed.image && embed.image.url) return false;
    return true;
  }

  const payload = {
    content: document.getElementById("content").value || ""
  };

  if (!isEmbedEmpty(embed)) {
    payload.embeds = [embed];
  }

  clean(payload);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      status.textContent = "✅ Sent successfully!";
      form.reset();
      fieldsContainer.innerHTML = ""; 
      updatePreview();
    } else {
      const text = await res.text();
      status.textContent = `❌ Failed to send: ${text}`;
    }
  } catch (err) {
    status.textContent = "⚠️ Error: " + err.message;
  }
});

  