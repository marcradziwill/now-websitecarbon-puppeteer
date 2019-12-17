const nodemailer = require('nodemailer');
const ow = require('ow');

ow(
  process.env.EMAIL_PASSWORD,
  'EMAIL_PASSWORD environment variable is not set',
  ow.string.minLength(1),
);
ow(
  process.env.EMAIL_USERNAME,
  'EMAIL_USERNAME environment variable is not set',
  ow.string.minLength(1),
);

const transporter = nodemailer.createTransport({
  host: 'in-v3.mailjet.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const translations = {
  de: {
    name: {
      minlength: 'Name ist zu kurz',
      maxlength: 'Name ist zu lang',
    },
    email: {
      email: 'Email nicht valide',
    },
    subject: {
      minlength: 'Bitte gibt angemessen viel Text ein. Mindestens 40 Zeichen.',
      maxlength: 'Bitte gibt angemessen viel Text ein. Maximal 1001 Zeichen',
    },
    text: {
      minlength: 'Bitte gibt angemessen viel Text ein. Mindestens 40 Zeichen.',
      maxlength: 'Bitte gibt angemessen viel Text ein. Maximal 1001 Zeichen',
    },
  },
  en: {
    name: {
      minlength: 'Name is too short',
      maxlength: 'Name is too long',
    },
    email: {
      email: 'Email is invalid',
    },
    subject: {
      minlength: 'Please keep the subject to a reasonable length',
      maxlength: 'Please keep the subject to a reasonable length',
    },
    text: {
      minlength: 'Please keep the text to a reasonable length',
      maxlength: 'Please keep the text to a reasonable length',
    },
  },
};

const sendMail = async (message) => {
  await transporter.verify();
  return transporter.sendMail(message);
};

module.exports = { translations, sendMail };
