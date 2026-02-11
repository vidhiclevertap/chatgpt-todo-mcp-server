import { createServer, tool } from "@modelcontextprotocol/sdk/server";

/**
 * In-memory store (demo only)
 */
const todos = [];

/**
 * Create MCP server
 */
const mcpServer = createServer({
  name: "Todo MCP Server",
  version: "1.0.0"
});

/**
 * Tool: Add Todo
 */
mcpServer.addTool(
  tool({
    name: "add_todo",
    description: "Add a new todo item",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string" }
      },
      required: ["text"]
    }
  }),
  async ({ text }) => {
    todos.push({ id: Date.now(), text });

    return {
      content: [
        { type: "text", text: `✅ Added todo: ${text}` }
      ]
    };
  }
);

/**
 * Tool: List Todos
 */
mcpServer.addTool(
  tool({
    name: "list_todos",
    description: "List all todos"
  }),
  async () => {
    if (!todos.length) {
      return {
        content: [{ type: "text", text: "No todos yet." }]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: todos.map((t, i) => `${i + 1}. ${t.text}`).join("\n")
        }
      ]
    };
  }
);

/**
 * 🚨 REQUIRED FOR VERCEL
 * Export a fetch handler
 */
export default {
  async fetch(request) {
    return mcpServer.handle(request);
  }
};
