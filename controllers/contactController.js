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

 // Controller Function to Get All Contact Emails
exports.getAllContactEmails = async (req, res) => {
    try {
      // Fetch all emails from the ContactMessage table
      const emails = await ContactMessage.find().distinct('email');
      res.json(emails);
    } catch (error) {
      console.error('Error fetching contact emails:', error);
      res.status(500).json({ msg: 'Server Error' });
    }
};

  // Controller Function to Get a Single Contact Message by ID
exports.getContactMessageById = async (req, res) => {
    const {messageId} = req.params;
  
    try {
      // Fetch the contact message by its ID
      const message = await ContactMessage.findById(messageId);
      
      if (!message) {
        return res.status(404).json({ msg: 'Message not found' });
      }
  
      res.json(message);
    } catch (error) {
      console.error('Error fetching contact message:', error);
      res.status(500).json({ msg: 'Server Error' });
    }
};
  
  
  // Admin Send Email to Contact Email Controller
  exports.sendEmailToContact = async (req, res) => {
    const { email, subject, message } = req.body;
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
        from: 'admin@aduvieevents.com',
        to: email,
        subject: subject,
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
  
  
