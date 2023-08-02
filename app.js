const accountSid = process.env.TWILIO_ACCOUNT_SID;
if (!accountSid)
	throw 'TWILIO_ACCOUNT_SID env var required.'
const authToken = process.env.TWILIO_AUTH_TOKEN;
if (!authToken)
	throw 'TWILIO_AUTH_TOKEN env var required.'
// twilio FROM number:
const twsender = process.env.TWILIO_SENDER;
if (!twsender)
	throw 'TWILIO_SENDER env var required.'
// Destination phone number, optional here
const twreceiver = (process.env.TWILIO_RECEIVER || null);
const twclient = require('twilio')(accountSid, authToken, {
	autoRetry: true,
	maxRetries: 3,
});

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.type('txt');
	res.send('alert2twcall up\n');
});


app.post('/call', async (req, res) => {
	res.type('application/json');
	const body = req.body;
	let { loop, receiver } = req.query;
	const gentwiml = text => `
		<Response>
			<Say loop="${loop}"><break time="1s" />${text}</Say>
		</Response>
	`;

	// loop indefinitely by default
	if (loop === undefined) {
		loop = "0";
	} else if (!/^\d+$/.test(loop)) {
		return res.status(400).send({ err: 'bad loop argument' })
	}

	if (receiver === undefined) {
		receiver = twreceiver; // use default receiver
	}
	if (!receiver) {
		return res.status(400).send({ err: 'no receiver set' });
	}
	if (!/^\+?\d+(,\+\d+)*$/.test(receiver)) {
		return res.status(400).send({ err: 'bad receiver ' + receiver });
	}
	receivers = receiver.split(',');

	if (!req.body || !req.body.status || !req.body.alerts)
		return res.status(400).send({ err: 'bad body' });

	let message = req.body.alerts
		.filter(a => (a.annotations || {}).summary)
		.map(a => a.annotations.summary)
		.join('. ');
	let twiml = gentwiml(message);
	let ret = [];
	let status = 200;
	for (r of receivers) {
		try {
			const call = await twclient.calls.create({
				to: r,
				from: twsender,
				twiml
			})
			ret.push({ sid: call.sid });
		} catch (err) {
			status = 400;
			console.log('ERROR', err)
			ret.push({ err });
		}
	}
	return res.status(status).send(ret);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
