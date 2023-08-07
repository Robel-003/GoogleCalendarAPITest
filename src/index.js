import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';
import dayjs from 'dayjs';

const calendar = google.calendar({version: 'v3', auth: process.env.GOOGLE_CALENDAR_API_KEY});

const app = express({});

const PORT = process.env.PORT || 8000;

/*  */
const oauth2Client  = new google.auth.OAuth2(
  /* 3 things needed to se up OAuth2 client */
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL,
)

/* */
const scopes = [
  'https://www.googleapis.com/auth/calendar'
];


/* getting user login thru google */
app.get('/google', (req, res) => {
  /* generate url getting permission from google and getting token */
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  res.redirect(url);
});

/* token will be available thru this redirect url */
app.get('/google/redirect', async (req, res) => {
  /* getting token from google and request user info */ 
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    res.send({
      msg: "You have successfully logged in",
    });
  } catch (error) {
    console.error("Error fetching token:", error);
    res.status(500).send({
      error: "An error occurred while fetching the token",
    });
  }
  
});


/* for spacesaver proj. think about how to grab user's typed info into this create event section for calendar */
app.get('/schedule_event', async (req, res) => {
  
  await calendar.events.insert({
    calendarId: 'primary',
    auth: oauth2Client,
    requestBody: {
      summary: 'Space Saver Test Event',
      description: 'Booking a test event',
      start: {
        dateTime: dayjs(new Date()).add(1, 'day').toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: dayjs(new Date()).add(1, 'day').add(1, 'hour').toISOString(),
        timeZone: 'America/Los_Angeles',
      },
    },
  }, (err, event) => {
    if (err) {
      res.status(400).send(err, err.message);
    } else {
      res.status(200).send(event);
    }
  });

});


/* updating scheduled event */
/*
app.put('/update_event/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  try {
    await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      auth: oauth2Client,
      requestBody: {
        summary: 'Updated Space Saver Test Event',
        description: 'Updating booking a test event',
        start: {
          dateTime: dayjs(new Date()).add(2, 'day').toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: dayjs(new Date()).add(2, 'day').add(1, 'hour').toISOString(),
          timeZone: 'America/Los_Angeles',
        },
      },
    });
    res.status(200).send({
      msg: "Event updated successfully",
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).send({
      error: "An error occurred while updating the event",
    });
  }
});
*/


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});