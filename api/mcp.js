export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      name: "ChatGPT Todo MCP Server",
      status: "running"
    });
  }

  if (req.method === "POST") {
    const body = req.body;

    return res.status(200).json({
      success: true,
      received: body
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
