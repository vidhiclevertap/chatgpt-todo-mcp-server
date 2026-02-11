const CLEVERTAP_ACCOUNT_ID = "848-6W6-WR7Z";
const CLEVERTAP_PASSCODE = process.env.CLEVERTAP_PASSCODE;

async function pushEvent(identity, eventName, data = {}) {
  await fetch(
    "https://us1.api.clevertap.com/1/upload",
    {
      method: "POST",
      headers: {
        "X-CleverTap-Account-Id": CLEVERTAP_ACCOUNT_ID,
        "X-CleverTap-Passcode": CLEVERTAP_PASSCODE,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        d: [
          {
            identity,
            type: "event",
            evtName: eventName,
            evtData: data
          }
        ]
      })
    }
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ status: "running" });
  }

  const { action, email, todo } = req.body;

  if (action === "login") {
    await pushEvent(email, "User Logged In");
    return res.json({ message: `Logged in as ${email}` });
  }

  if (action === "add_todo") {
    await pushEvent(email, "Todo Added", { todo });
    return res.json({ message: `Todo added: ${todo}` });
  }

  if (action === "lead_capture") {
    await pushEvent(email, "Lead Captured", {});
    return res.json({ message: `Lead captured for ${email}` });
  }

  return res.json({ error: "Unknown action" });
}
