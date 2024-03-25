const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const schedule = require('node-schedule');

// Book Events
exports.bookEvent = async (req, res) => {
  const { firstName, lastName, email, description, phone, date } = req.body;

  try {

     // Check if there's an existing booking with the same date
     const existingBooking = await Booking.findOne({ date });

     if (existingBooking) {
       return res.status(400).json({ msg: 'A booking already exists for this date' });
     }
    // Save booking to database (optional)
    const booking = new Booking({ firstName, lastName, email, description, phone, date });
    await booking.save();

    // Send confirmation email
    await sendConfirmationEmail(firstName, lastName, email, date);

    // Schedule email reminder one day before the event
    scheduleReminder(booking);

    res.json({ msg: 'Booking successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// Controller function to check date availability
exports.checkDateAvailability = async (req, res) => {
    const { date } = req.body;

    try {
        // Check if any booking exists for the specified date
        const existingBooking = await Booking.findOne({ date });

        if (existingBooking) {
            return res.json({ msg: 'Date already booked' });
        }

        // If no booking exists for the date, it is available
        res.json({ msg: 'Date available' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// Get All Bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update Booking Status
exports.updateBookingStatus = async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;
  
    try {
      let booking = await Booking.findById(bookingId);
  
      if (!booking) {
        return res.status(404).json({ msg: 'Booking not found' });
      }
  
      booking.status = status;
      await booking.save();
  
      res.json({ msg: 'Booking status updated successfully', booking });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};

// Delete Bookings
exports.deleteBooking = async (req, res) => {
    const { bookingId } = req.params;
  
    try {
      let booking = await Booking.findByIdAndDelete(bookingId);
  
      if (!booking) {
        return res.status(404).json({ msg: 'Booking not found' });
      }
  
      res.json({ msg: 'Booking deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};

// Send Confirmation Email
const sendConfirmationEmail = async (firstName, lastName, email, date) => {
  try {
    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: 'mail.aduvieevents.com', 
      port: 465,                       
      secure: true,                    
      auth: {
          user: 'support@aduvieevents.com',  
          pass: 'blues0001153'   
        }
    });

    // Email content
    const mailOptions = {
      from: 'support@aduvieevents.com',
      to: email,
      subject: 'Booking Confirmation',
      html: `Dear ${firstName} ${lastName}\n\n
              Your booking scheduled for ${date} has been confirmed.
              \n\n Thank you for choosing our service.
              \nBest regards,\nAduvie Event Management Team
             <center><p><img src="https://aduvie-blush.vercel.app/assets/main-B7reynfm.jpeg" width="200px" alt="Aduvie Events Logo"></p></center>`
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending confirmation email:', err);
    // Handle email sending error
  }
};

// Schedule Email Reminder One Day Before
const scheduleReminder = (booking) => {
    // Extract date and time of the booking
    const bookingDate = new Date(booking.date);
    const reminderDate = new Date(bookingDate.getTime() - 24 * 60 * 60 * 1000); // One day before boking
  
    // Schedule task to send reminder
    schedule.scheduleJob(reminderDate, () => {
        sendConfirmationEmail(booking);
    });
};

// Get total number of admins
exports.getTotalBookings = async (req, res) => {
  try {
    const totalBooking = await Booking.countDocuments();
    res.status(200).json({ totalBooking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch total bookings', error: error.message });
  }
};

//get booking by id
exports.getBookingId = async (req, res) => {
  const {bookingId} = req.params;

  try {
    // Fetch the contact message by its ID
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

 // Admin Send Email to user Email Controller
 exports.sendEmailToContact = async (req, res) => {
  const { email, message } = req.body;
  try {
      const transporter = nodemailer.createTransport({
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
      to: email,
      subject: 'Event Booking Feedback',
      html: `Dear User\n\n
             <p>${message}</p>
             \n\nBest regards,
             \nAduvie Event Management Team
             <center><p><img src="https://aduvie-blush.vercel.app/assets/main-B7reynfm.jpeg" width="200px" alt="Aduvie Events Logo"></p></center>`
      
    };

    await transporter.sendMail(mailOptions);

    res.json({ msg: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email to contact:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

