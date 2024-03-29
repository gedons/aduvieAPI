const nodemailer = require('nodemailer');
const Event = require('../models/Event');
const schedule = require('node-schedule');
const path = require('path');
const fs = require('fs');
const { Dropbox } = require('dropbox');

 
const dropbox = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch  
});

// Create Event
exports.createEvent = async (req, res) => {

  const file = req.file;

   if (!file) {
     return res.status(400).send('No file uploaded');
   }

  const { name, date, status, email, description } = req.body;

  try {
    const fileBuffer = fs.readFileSync(file.path);
    const path = `/uploads/${file.filename}`;

    const fileData = await dropbox.filesUpload({
      path: path,
      contents: fileBuffer,
    });
 

    // path for creating a shared link
    const sharedLinkPath = { path: fileData.result.path_display };

    // Create a shared link for the file
    const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings(sharedLinkPath);

    // Extract the link from the shared link
    let imageUrl = sharedLink.result.url;

    imageUrl = imageUrl.replace(/dl=0/, 'raw=1');

    const event = new Event({
      imageUrl,
      name,
      date,
      status,
      email,
      description
    });

    await event.save();

    // Send email reminder
    sendEmailReminder(event);

    // Schedule email reminder one day before the event
    scheduleReminder(event);

    res.json({ msg: 'Event created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get All Events
exports.getAllEvents = async (req, res) => {
    try {
      const events = await Event.find();
      res.json(events);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};

// Update Event
exports.updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const { name, date, status, email, description } = req.body; 
  let imageUrl = req.body.imageUrl;  

  try {
      // Check if an image file is included in the request
      if (req.file) {
          const fileBuffer = fs.readFileSync(req.file.path);
          const path = `/uploads/${req.file.filename}`;
    
          // Upload the file to Dropbox
          const fileData = await dropbox.filesUpload({
              path: path,
              contents: fileBuffer,
          });
      
          // Create a shared link for the file
          const sharedLinkPath = { path: fileData.result.path_display };
          const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings(sharedLinkPath);
      
          // Extract the link from the shared link
          imageUrl = sharedLink.result.url;
          imageUrl = imageUrl.replace(/dl=0/, 'raw=1');
      }

      // Update the event with the new image URL
      let event = await Event.findByIdAndUpdate(eventId, { name, date, status, email, description, imageUrl }, { new: true });

      if (!event) {
          return res.status(404).json({ msg: 'Event not found' });
      }

      res.json({ msg: 'Event updated successfully', event });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
};


// Update Event Status
exports.updateEventStatus = async (req, res) => {
  const { eventId, status } = req.body;

  try {
    let event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    event.status = status;

    await event.save();

    res.json({ msg: 'Event status updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await Event.findByIdAndDelete(eventId);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        res.json({ msg: 'Event deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Send Email Reminder
const sendEmailReminder = (event) => {
  const transport = nodemailer.createTransport({
    host: 'mail.aduvieevents.com', 
      port: 465,                       
      secure: true,                    
      auth: {
          user: 'support@aduvieevents.com',  
          pass: 'blues0001153'   
    }
  });

  const mailOptions = {
    from: 'support@aduvieevents.com',
    to: event.email,
    subject: 'Event Reminder',
    html: `Dear User\n\n
            This is a reminder for the event 
            <p>Event Name: ${event.name}</p>\n\n
            scheduled for ${event.date}
            <center><p><img src="https://aduvie-blush.vercel.app/assets/main-B7reynfm.jpeg" width="200px" alt="Aduvie Events Logo"></p></center>`
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

// Schedule Email Reminder One Day Before
const scheduleReminder = (event) => {
    // Extract date and time of the event
    const eventDate = new Date(event.date);
    const reminderDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); // One day before event
  
    // Schedule task to send reminder
    schedule.scheduleJob(reminderDate, () => {
        sendEmailReminder(event);
    });
};

// Get total number of events
exports.getTotalEvents = async (req, res) => {
  try {
    const totalEvent = await Event.countDocuments();
    res.status(200).json({ totalEvent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch total events', error: error.message });
  }
};

// Get events with status pending
exports.getPendingEvents = async (req, res) => {
  try {
    const pendingEvents = await Event.find({ status: 'pending' });
    res.json(pendingEvents);
  } catch (error) {
    console.error('Error fetching pending events:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};


