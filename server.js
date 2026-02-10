import {
  createServer,
  tool
} from "@modelcontextprotocol/sdk/server";

const todos = [];

/* ---------------- MCP SERVER ---------------- */

const server = createServer({
  name: "Todo MCP Server",
  version: "1.0.0"
});

/* ---------------- TOOLS ---------------- */

/**
 * Add a todo (ChatGPT native input)
 */
server.addTool(
  tool({
    name: "add_todo",
    description: "Add a new todo item",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The todo text"
        }
      },
      required: ["text"]
    }
  }),
  async ({ text }) => {
    const todo = {
      id: Date.now(),
      text
    };

    todos.push(todo);

    return {
      content: [
        {
          type: "text",
          text: `✅ Todo added: "${text}"`
        }
      ]
    };
  }
);

/**
 * List todos
 */
server.addTool(
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
          text: todos
            .map((t, i) => `${i + 1}. ${t.text}`)
            .join("\n")
        }
      ]
    };
  }
);

/**
 * Clear todos
 */
server.addTool(
  tool({
    name: "clear_todos",
    description: "Remove all todos"
  }),
  async () => {
    todos.length = 0;
    return {
      content: [{ type: "text", text: "🧹 All todos cleared." }]
    };
  }
);

/* ---------------- EXPORT FOR VERCEL ---------------- */

export default server;
