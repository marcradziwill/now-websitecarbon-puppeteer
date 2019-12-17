const { URL } = require('url');
const ow = require('ow');
const { translations, sendMail } = require('./utils/utils');
const Mailchimp = require('mailchimp-api-v3');
const crypto = require('crypto');
const mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY);

const isEmail = ow.string.is((e) => /^.+@.+\..+$/.test(e));

module.exports = async (req, res) => {
  const runId = Date.now()
    .toString()
    .slice(-5);
  // eslint-disable-next-line no-console
  const log = (...args) => console.log(runId, ...args);

  const origin = new URL(req.headers.origin);

  const acceptable =
    (origin.hostname === 'localhost' &&
      process.env.NODE_ENV !== 'production') ||
    origin.hostname === 'marcradziwill.com';

  if (!acceptable) {
    res.status(403).send(`Unacceptable request`);
  }

  if (req.method === 'OPTIONS') {
    res.status(200).send(`CORS ok`);
  }

  if (req.body) {
    const { EMAIL, FNAME, LNAME, TYPEFOR, locale } = req.body;
    try {
      log('> Validating input', ' email:', EMAIL);
      if (!ow.isValid(EMAIL, isEmail)) {
        throw new Error(translations[locale].email.email);
      }
    } catch (e) {
      log('> Validation failed', e.message);
      res.status(403).json({ success: false, message: e.message });
    }

    const formatedBody = {
      email_address: EMAIL,
      status: 'pending',
      merge_fields: { FNAME, LNAME, TYPEFOR },
    };

    const hash = crypto
      .createHash('md5')
      .update(EMAIL)
      .digest('hex');

    let mailchimpUser;
    try {
      log('> Sending get request...');
      mailchimpUser = await mailchimp.get(`/lists/d8416f8ef8/members/${hash}`);
      log('> Send success!');
    } catch (error) {
      log('> Send failure!', error.message);
    }

    try {
      if (mailchimpUser === undefined) {
        log('> Sending post request...');
        await mailchimp.post('/lists/d8416f8ef8/members', formatedBody);
      } else {
        if (mailchimpUser.status == 'subscribed') {
          res.status(200).json({ success: true });
          return;
        }
        log('> Sending put request...');
        await mailchimp.put(`/lists/d8416f8ef8/members/${hash}`, formatedBody);
      }
      log('> Send success!');
    } catch (error) {
      log('> Send failure!', error.message);
      const message = {
        from: `"Marc" <hallo@marcradziwill.com>`,
        to: `"marc radziwill. Team" <hallo@marcradziwill.com>`,
        subject: `error on newsletter api please see logs`,
        text: `please see: ${hash}`,
      };
      await sendMail(message);
      res.status(500).send(error.message);
    }
    res.status(200).json({ success: true });
  }
};
