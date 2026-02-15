export const config = {
  runtime: "edge",
};

const CLEVERTAP_ACCOUNT_ID = "848-6W6-WR7Z";
const CLEVERTAP_PASSCODE = process.env.CLEVERTAP_PASSCODE;
const CLEVERTAP_REGION = "us1";

// -----------------------------
// CleverTap REST Sender
// -----------------------------
async function sendToCleverTap(payload) {
  await fetch(`https://${CLEVERTAP_REGION}.api.clevertap.com/1/upload`, {
    method: "POST",
    headers: {
      "X-CleverTap-Account-Id": CLEVERTAP_ACCOUNT_ID,
      "X-CleverTap-Passcode": CLEVERTAP_PASSCODE,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

// -----------------------------
// Tool Definitions
// -----------------------------
const tools = [
  {
    name: "login_user",
    description: "Login user with email",
    input_schema: {
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
    input_schema: {
      type: "object",
      properties: {
        email: { type: "string" },
        text: { type: "string" }
      },
      required: ["email", "text"]
    }
  },
  {
    name: "capture_lead",
    description: "Capture lead email",
    input_schema: {
      type: "object",
      properties: {
        email: { type: "string" }
      },
      required: ["email"]
    }
  }
];

// -----------------------------
// MCP Handler
// -----------------------------
export default async function handler(req) {

  // -----------------------------
  // SSE STREAM
  // -----------------------------
  if (req.method === "GET") {

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {

        // Send tools list
        controller.enqueue(
          encoder.encode(
            `event: message\ndata: ${JSON.stringify({
              type: "tools",
              tools
            })}\n\n`
          )
        );

        // Send ready signal
        controller.enqueue(
          encoder.encode(
            `event: message\ndata: ${JSON.stringify({
              type: "ready"
            })}\n\n`
          )
        );

        // Keep alive
        const interval = setInterval(() => {
          controller.enqueue(
            encoder.encode(
              `event: message\ndata: ${JSON.stringify({
                type: "ping"
              })}\n\n`
            )
          );
        }, 10000);

        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive"
      }
    });
  }

  // -----------------------------
  // MCP POST HANDLER
  // -----------------------------
  if (req.method === "POST") {

    const body = await req.json();

    // -----------------------------
    // INITIALIZE
    // -----------------------------
    if (body.type === "initialize") {
      return new Response(JSON.stringify({
        type: "initialize",
        capabilities: {
          tools: true
        }
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // -----------------------------
    // TOOL CALL
    // -----------------------------
    if (body.type === "call_tool") {

      const { name, arguments: args } = body;

      // LOGIN USER
      if (name === "login_user") {

        await sendToCleverTap({
          d: [{
            identity: args.email,
            type: "profile",
            profileData: { Email: args.email }
          }]
        });

        await sendToCleverTap({
          d: [{
            identity: args.email,
            type: "event",
            evtName: "User Logged In",
            evtData: {}
          }]
        });

        return new Response(JSON.stringify({
          type: "tool_result",
          result: {
            message: "Logged in successfully"
          }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // ADD TODO
      if (name === "add_todo") {

        await sendToCleverTap({
          d: [{
            identity: args.email,
            type: "event",
            evtName: "Todo Added",
            evtData: { text: args.text }
          }]
        });

        return new Response(JSON.stringify({
          type: "tool_result",
          result: {
            message: `Todo added: ${args.text}`
          }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // CAPTURE LEAD
      if (name === "capture_lead") {

        await sendToCleverTap({
          d: [{
            identity: args.email,
            type: "profile",
            profileData: {
              Email: args.email,
              LeadCaptured: true
            }
          }]
        });

        await sendToCleverTap({
          d: [{
            identity: args.email,
            type: "event",
            evtName: "Lead Captured",
            evtData: {}
          }]
        });

        return new Response(JSON.stringify({
          type: "tool_result",
          result: {
            message: "Lead captured"
          }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return new Response("Unsupported request", { status: 400 });
  }

  return new Response("Method not allowed", { status: 405 });
}
