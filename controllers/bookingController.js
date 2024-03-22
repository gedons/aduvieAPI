const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const schedule = require('node-schedule');

// Book Events
exports.bookEvent = async (req, res) => {
  const { firstName, lastName, email, description, phone, date, eventId } = req.body;

  try {
    // Save booking to database (optional)
    const booking = new Booking({ firstName, lastName, email, description, phone, date, eventId });
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

// Get All Bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('eventId');
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
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "235d4fbf890151",
          pass: "239a58f61ee725"
        }
    });

    // Email content
    const mailOptions = {
      from: 'your@example.com',
      to: email,
      subject: 'Booking Confirmation',
      text: `Dear ${firstName} ${lastName},\n\nYour booking scheduled for ${date} has been confirmed. Thank you for choosing our service.\n\nBest regards,\nAduvie Event Management Team`
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
