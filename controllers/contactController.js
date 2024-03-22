const ContactMessage = require('../models/ContactMessage');
const nodemailer = require('nodemailer');

// Handle contact form submission
exports.submitContactForm = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    // Save contact message to the database
    const newContactMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message
    });
    await newContactMessage.save();

    // Send email notification to admin
    sendEmailReminder(name, email, phone, subject, message);

    res.json({ msg: 'Contact message submitted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Function to send email notification
const sendEmailReminder = (name, email, phone, subject, message) => {
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "235d4fbf890151",
          pass: "239a58f61ee725"
      }
    });
  
    const mailOptions = {
      from: email,  
      to: 'admin@aduvieevents.com',
      subject: 'New Contact Form Submission',
      html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p><p>Subject: ${subject}</p><p>Message: ${message}</p>`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
};

// Admin View Contact Messages Controller
exports.getAllContactMessages = async (req, res) => {
    try {
      // Fetch all contact messages from the database
      const contactMessages = await ContactMessage.find();
      res.json(contactMessages);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      res.status(500).json({ msg: 'Server Error' });
    }
  };
  
  // Admin Delete Contact Message Controller
  exports.deleteContactMessage = async (req, res) => {
    const { messageId } = req.params;
    try {
      // Delete the contact message from the database
      await ContactMessage.findByIdAndDelete(messageId);
      res.json({ msg: 'Contact message deleted successfully' });
    } catch (error) {
      console.error('Error deleting contact message:', error);
      res.status(500).json({ msg: 'Server Error' });
    }
  };
  
  // Admin Send Email to Contact Email Controller
  exports.sendEmailToContact = async (req, res) => {
    const { email, subject, message } = req.body;
    try {
        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "235d4fbf890151",
              pass: "239a58f61ee725"
          }
        });
  
      const mailOptions = {
        from: 'admin@aduvieevents.com',
        to: email,
        subject: subject,
        html: `<p>${message}</p>`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({ msg: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email to contact:', error);
      res.status(500).json({ msg: 'Server Error' });
    }
  };
  
  
