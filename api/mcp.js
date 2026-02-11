export const config = {
  runtime: "edge",
};

export default async function handler(req) {

  // 1️⃣ Tool discovery (SSE stream)
  if (req.method === "GET") {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const tools = {
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
        };

        controller.enqueue(
          encoder.encode(
            `event: tools\ndata: ${JSON.stringify(tools)}\n\n`
          )
        );

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  }

  // 2️⃣ Tool execution handler
  if (req.method === "POST") {
    const body = await req.json();
    const { name, arguments: args } = body;

    let result = {};

    if (name === "login_user") {
      result = {
        message: `User ${args.email} logged in`
      };
    }

    if (name === "add_todo") {
      result = {
        message: `Todo added: ${args.text}`
      };
    }

    if (name === "capture_lead") {
      result = {
        message: `Lead captured: ${args.email}`
      };
    }

    return new Response(
      JSON.stringify({ result }),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  return new Response("Method not allowed", { status: 405 });
}
