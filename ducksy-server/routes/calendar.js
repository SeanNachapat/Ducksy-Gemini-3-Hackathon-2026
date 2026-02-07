const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

router.post('/create', async (req, res) => {
      const { title, description, startTime, endTime, accessToken, refreshToken } = req.body;

      if (!title || !startTime || !accessToken) {
            return res.status(400).json({ error: 'Missing required fields: title, startTime, accessToken' });
      }

      try {
            const oauth2Client = new google.auth.OAuth2(
                  process.env.GOOGLE_CLIENT_ID,
                  process.env.GOOGLE_CLIENT_SECRET,
                  process.env.GOOGLE_REDIRECT_URI
            );

            oauth2Client.setCredentials({
                  access_token: accessToken,
                  refresh_token: refreshToken
            });

            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            const event = {
                  summary: title,
                  description: description || '',
                  start: {
                        dateTime: startTime,
                        timeZone: 'Asia/Bangkok'
                  },
                  end: {
                        dateTime: endTime || new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(),
                        timeZone: 'Asia/Bangkok'
                  }
            };

            const result = await calendar.events.insert({
                  calendarId: 'primary',
                  resource: event
            });

            res.json({
                  success: true,
                  eventId: result.data.id,
                  eventLink: result.data.htmlLink
            });
      } catch (error) {
            console.error('Calendar create error:', error);
            res.status(500).json({ error: error.message });
      }
});

module.exports = router;
