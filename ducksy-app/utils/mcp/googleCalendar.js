const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const db = require("../db");

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

let oauth2Client = null;

const getOAuth2Client = async () => {
      if (oauth2Client) return oauth2Client;

      const credential = await db.getMcpCredential("google_calendar");
      if (!credential || !credential.client_id || !credential.client_secret) {
            return null;
      }

      oauth2Client = new OAuth2Client(
            credential.client_id,
            credential.client_secret,
            REDIRECT_URI
      );

      if (credential.access_token) {
            oauth2Client.setCredentials({
                  access_token: credential.access_token,
                  refresh_token: credential.refresh_token
            });
      }

      return oauth2Client;
};

const getAuthUrl = async (clientId, clientSecret) => {
      await db.saveMcpCredential("google_calendar", {
            client_id: clientId,
            client_secret: clientSecret
      });

      oauth2Client = new OAuth2Client(clientId, clientSecret, REDIRECT_URI);

      return oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
            prompt: "consent"
      });
};

const exchangeCodeForTokens = async (code) => {
      const client = await getOAuth2Client();
      if (!client) throw new Error("OAuth client not initialized");

      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);

      await db.saveMcpCredential("google_calendar", {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            additional_info: { token_type: tokens.token_type, expiry_date: tokens.expiry_date }
      });

      return tokens;
};

const isConnected = async () => {
      const credential = await db.getMcpCredential("google_calendar");
      return !!(credential && credential.access_token);
};

const disconnect = async () => {
      oauth2Client = null;
      await db.deleteMcpCredential("google_calendar");
};

const createCalendarEvent = async (sessionData) => {
      const client = await getOAuth2Client();
      if (!client) throw new Error("Not connected to Google Calendar");

      const calendar = google.calendar({ version: "v3", auth: client });

      const startTime = new Date(sessionData.createdAt);
      const endTime = new Date(startTime.getTime() + (sessionData.duration || 30) * 60 * 1000);

      const event = {
            summary: sessionData.title || "Ducksy Session",
            description: buildDescription(sessionData),
            start: {
                  dateTime: startTime.toISOString(),
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
                  dateTime: endTime.toISOString(),
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
      };

      const result = await calendar.events.insert({
            calendarId: "primary",
            resource: event
      });

      return result.data;
};

const buildDescription = (sessionData) => {
      let description = "";

      if (sessionData.details?.summary) {
            description += `Summary:\n${sessionData.details.summary}\n\n`;
      }

      if (sessionData.details?.actionItems?.length > 0) {
            description += "Action Items:\n";
            sessionData.details.actionItems.forEach((item, i) => {
                  description += `${i + 1}. ${item}\n`;
            });
            description += "\n";
      }

      description += `Mode: ${sessionData.mode}\n`;
      description += `Duration: ${sessionData.duration || 0} seconds\n`;
      description += "\n---\nCreated by Ducksy";

      return description;
};

module.exports = {
      getAuthUrl,
      exchangeCodeForTokens,
      isConnected,
      disconnect,
      createCalendarEvent
};
