export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders?.();

  // Send tool manifest first
  res.write(`event: tools\n`);
  res.write(
    `data: ${JSON.stringify({
      tools: [
        {
          name: "login_user",
          description: "Login user with email",
          parameters: {
            type: "object",
            properties: {
              email: { type: "string" }
            },
            required: ["email"]
          }
        },
        {
          name: "add_todo",
          description: "Add a todo item",
          parameters: {
            type: "object",
            properties: {
              text: { type: "string" }
            },
            required: ["text"]
          }
        },
        {
          name: "capture_lead",
          description: "Capture lead email",
          parameters: {
            type: "object",
            properties: {
              email: { type: "string" }
            },
            required: ["email"]
          }
        }
      ]
    })}\n\n`
  );

  // Keep alive
  const interval = setInterval(() => {
    res.write(`event: ping\n`);
    res.write(`data: {}\n\n`);
  }, 20000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
}

