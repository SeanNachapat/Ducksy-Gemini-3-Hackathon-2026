const { Client } = require("@notionhq/client");
const db = require("../db");

let notionClient = null;

const getNotionClient = async () => {
      if (notionClient) return notionClient;

      const credential = await db.getMcpCredential("notion");
      if (!credential || !credential.access_token) {
            return null;
      }

      notionClient = new Client({ auth: credential.access_token });
      return notionClient;
};

const saveAccessToken = async (accessToken, workspaceInfo = {}) => {
      await db.saveMcpCredential("notion", {
            access_token: accessToken,
            additional_info: workspaceInfo
      });

      notionClient = new Client({ auth: accessToken });
      return notionClient;
};

const isConnected = async () => {
      const credential = await db.getMcpCredential("notion");
      return !!(credential && credential.access_token);
};

const disconnect = async () => {
      notionClient = null;
      await db.deleteMcpCredential("notion");
};

const getDatabases = async () => {
      const client = await getNotionClient();
      if (!client) throw new Error("Not connected to Notion");

      const response = await client.search({
            filter: { property: "object", value: "database" }
      });

      return response.results.map(db => ({
            id: db.id,
            title: db.title?.[0]?.plain_text || "Untitled",
            icon: db.icon?.emoji || "📄"
      }));
};

const createPage = async (databaseId, sessionData) => {
      const client = await getNotionClient();
      if (!client) throw new Error("Not connected to Notion");

      const properties = {
            Name: {
                  title: [{ text: { content: sessionData.title || "Ducksy Session" } }]
            }
      };

      const children = buildPageContent(sessionData);

      const response = await client.pages.create({
            parent: { database_id: databaseId },
            properties,
            children
      });

      return response;
};

const buildPageContent = (sessionData) => {
      const blocks = [];

      blocks.push({
            object: "block",
            type: "heading_2",
            heading_2: {
                  rich_text: [{ type: "text", text: { content: "Session Details" } }]
            }
      });

      blocks.push({
            object: "block",
            type: "paragraph",
            paragraph: {
                  rich_text: [
                        { type: "text", text: { content: `Mode: ${sessionData.mode}\n` } },
                        { type: "text", text: { content: `Duration: ${sessionData.duration || 0} seconds\n` } },
                        { type: "text", text: { content: `Created: ${new Date(sessionData.createdAt).toLocaleString()}` } }
                  ]
            }
      });

      if (sessionData.details?.summary) {
            blocks.push({
                  object: "block",
                  type: "heading_2",
                  heading_2: {
                        rich_text: [{ type: "text", text: { content: "Summary" } }]
                  }
            });

            blocks.push({
                  object: "block",
                  type: "paragraph",
                  paragraph: {
                        rich_text: [{ type: "text", text: { content: sessionData.details.summary } }]
                  }
            });
      }

      if (sessionData.details?.actionItems?.length > 0) {
            blocks.push({
                  object: "block",
                  type: "heading_2",
                  heading_2: {
                        rich_text: [{ type: "text", text: { content: "Action Items" } }]
                  }
            });

            sessionData.details.actionItems.forEach(item => {
                  blocks.push({
                        object: "block",
                        type: "to_do",
                        to_do: {
                              rich_text: [{ type: "text", text: { content: item } }],
                              checked: false
                        }
                  });
            });
      }

      return blocks;
};

const getSelectedDatabase = async () => {
      const credential = await db.getMcpCredential("notion");
      if (!credential?.additional_info) return null;

      try {
            const info = typeof credential.additional_info === 'string'
                  ? JSON.parse(credential.additional_info)
                  : credential.additional_info;
            return info.selectedDatabaseId || null;
      } catch {
            return null;
      }
};

const setSelectedDatabase = async (databaseId) => {
      const credential = await db.getMcpCredential("notion");
      if (!credential) throw new Error("Not connected to Notion");

      let additionalInfo = {};
      try {
            additionalInfo = typeof credential.additional_info === 'string'
                  ? JSON.parse(credential.additional_info)
                  : credential.additional_info || {};
      } catch {
            additionalInfo = {};
      }

      additionalInfo.selectedDatabaseId = databaseId;

      await db.saveMcpCredential("notion", {
            additional_info: additionalInfo
      });
};

module.exports = {
      saveAccessToken,
      isConnected,
      disconnect,
      getDatabases,
      createPage,
      getSelectedDatabase,
      setSelectedDatabase
};
