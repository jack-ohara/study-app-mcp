import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  addMiscNotes,
  addNotesToLesson,
  getAllNotes,
  initDb,
} from "./utils/db.ts";

const app = express();
app.use(express.json());

const server = new McpServer({
  name: "Study App MCP Server",
  version: "1.0.0",
});

server.tool(
  "add-class-study-notes",
  {
    term: z.number(),
    classNumber: z.number(),
    notes: z.array(z.string()),
  },
  async (params) => {
    console.log("Received study notes:", { params });

    await addNotesToLesson(params.term, params.classNumber, params.notes);

    return {
      content: [{ type: "text", text: "Study notes added successfully." }],
    };
  }
);

server.tool(
  "add-misc-study-notes",
  {
    notes: z.array(z.string()),
  },
  async (params) => {
    console.log("Received study notes: ", { params });

    await addMiscNotes(params.notes);

    return {
      content: [{ type: "text", text: "Study notes added successfully." }],
    };
  }
);

server.resource("study-notes", "study-notes://all", async (uri) => {
  const data = await getAllNotes();

  return {
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(data),
        mimeType: "application/json",
      },
    ],
  };
});

app.post("/mcp", async (req, res) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      console.log("Request closed");
      transport.close();
      server.close();
    });

    await server.connect(transport);
    transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (req, res) => {
  console.log("Received GET MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});

app.delete("/mcp", async (req, res) => {
  console.log("Received DELETE MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});

app.listen(3003, () => {
  console.log("Server is listening on port 3003");
  initDb();
});
