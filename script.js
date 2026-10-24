
(() => {
  "use strict";

  const COMMANDS = [
    "pkg install python",
    "apt update",
    "apt upgrade",
    "jk.hc",
    "run",
    "/openmainpage",
    "/help",
    "/ctn"
  ];

  const $ = id => document.getElementById(id);
  let step = 0;
  let keyGenerated = false;
  let activated = false;
  let accessKey = "";
  let audioContext;
  let toastTimer;

  function sound(success = false) {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audioContext = audioContext || new Audio();
      if (audioContext.state === "suspended") audioContext.resume();

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(success ? 650 : 400, now);
      if (success) oscillator.frequency.exponentialRampToValueAtTime(950, now + 0.12);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.04, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.18);
    } catch (_) {}
  }

  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function line(message, type = "output-muted") {
    const el = document.createElement("div");
    el.className = "line " + type;
    el.textContent = message;
    $("output").appendChild(el);
    $("output").scrollTop = $("output").scrollHeight;
  }

  function renderCommands() {
    const list = $("commands");
    list.replaceChildren();

    COMMANDS.forEach((command, index) => {
      const row = document.createElement("div");
      row.className = "command";
      if (index < step) row.classList.add("done");
      if (index === step && step < COMMANDS.length) row.classList.add("active");

      const number = document.createElement("span");
      number.className = "number";
      number.textContent = String(index + 1).padStart(2, "0");

      const name = document.createElement("span");
      name.textContent = command;

      row.append(number, name);
      if (index < step) {
        const mark = document.createElement("span");
        mark.textContent = "✓";
        mark.style.color = "var(--green)";
        row.appendChild(mark);
      }
      list.appendChild(row);
    });

    $("counter").textContent =
      String(step).padStart(2, "0") + " / 08";
    $("progress").style.width = (step / COMMANDS.length * 100) + "%";
    $("commandInput").placeholder = step < 8
      ? "Enter command " + (step + 1) + "..."
      : "Sequence complete";
    $("commandInput").disabled = step >= 8;
    $("executeButton").disabled = step >= 8;
  }

  function makeKey() {
    let digits = "";
    let letters = "";
    for (let i = 0; i < 10; i++) digits += Math.floor(Math.random() * 10);
    for (let i = 0; i < 3; i++) letters += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return digits + "-" + letters;
  }

  function handleCommand(raw) {
    const value = raw.trim();
    if (!value) return;

    line("> " + value, "echo");
    sound();

    if (step >= 8) {
      line("All eight commands are complete.");
      return;
    }

    if (value !== COMMANDS[step]) {
      line("Wrong command. Enter: " + COMMANDS[step], "warning");
      toast("Next: " + COMMANDS[step]);
      return;
    }

    if (step === 4 && !keyGenerated) {
      line("Generate your key using the button below first.", "warning");
      toast("Generate the demo key first");
      return;
    }

    if (step === 5 && !activated) {
      line("Enter run and complete activation first.", "warning");
      return;
    }

    switch (step) {
      case 0:
        line("Python installed successfully. (SIMULATED)", "success");
        break;
      case 1:
        line("apt updated. (SIMULATED)", "success");
        break;
      case 2:
        line("apt upgraded. (SIMULATED)", "success");
        break;
      case 3:
        line("JK.HC accepted. Generate your key below.", "success");
        $("keyArea").classList.remove("hidden");
        break;
      case 4:
        activated = true;
        line("● ACTIVATED", "success");
        break;
      case 5:
        line("/activated", "success");
        break;
      case 6:
      case 7:
        // These commands intentionally have no additional action.
        line(value + " received. No extra action added.");
        break;
    }

    step++;
    renderCommands();
    sound(true);

    if (step === 8) {
      line("All eight commands completed.", "success");
      toast("Sequence complete");
    }
  }

  $("commandForm").addEventListener("submit", event => {
    event.preventDefault();
    const input = $("commandInput");
    handleCommand(input.value);
    input.value = "";
    if (!input.disabled) input.focus();
  });

  $("generateKey").addEventListener("click", () => {
    if (!keyGenerated) {
      accessKey = makeKey();
      keyGenerated = true;
      $("keyValue").textContent = accessKey;
      $("keyBox").classList.remove("hidden");
      line("Demo access key generated: " + accessKey, "success");
      line("Return to the terminal and enter: run");
      toast("Demo key generated");
    } else {
      toast("Your demo key is already generated");
    }
    sound(true);
  });

  $("copyKey").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(accessKey);
      toast("Key copied");
    } catch (_) {
      toast("Select and copy the key manually");
    }
    sound();
  });

  window.addEventListener("DOMContentLoaded", () => {
    renderCommands();
    setTimeout(() => {
      $("loader").classList.add("hidden");
      $("app").classList.remove("hidden");
    }, 2200);
  });
})();
