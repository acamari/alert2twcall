
[fragments of this README are Copyright (c) 2016 Gaël Gillard, based on MIT License]::

# Prometheus alert with phone call

This is a program that will receive webhooks from
[prometheus alertmanager](https://prometheus.io/)
to send them as phone calls via twilio.

## Configuration

It needs the following environment variables:

- `TWILIO_ACCOUNT_SID` - Twilio Account SID
- `TWILIO_TOKEN` - Twilio Auth Token
- `TWILIO_RECEIVER` - Phone number of receiver (optional parameter, representing
  default receiver)
- `TWILIO_SENDER` - Phone number managed by Twilio (friendly name)
- `PORT` - tcp port to listen on (optional, `4000` by default)
- `HOST` - ip address to listen on (use `127.0.0.1` for ipv4 localhost, `::1` for
  ipv6 localhost, `0.0.0.0` for ipv4 all interfaces, `::` for ipv6 all
  interfaces) (optional, `127.0.0.1` by default)

You can see a basic launch inside the Makefile.

## API

`/`: ping alert2twcall application. Returns 200 OK if application works fine.

`/call?receiver=+number1,+number2`: send Prometheus firing alerts from payload to a rcv if
specified, or to default receiver, represented by TWILIO_RECEIVER environment
variable. If none is specified, status code 400 BadRequest is returned.

## Sound

By default the summary annotation for all the alerts is joined, then a TwiML
code is generated that says it loud in an indefinite loop. On the next
example you will hear in the phone: "Server down. Server down. ...".
You can customize the sound by setting a summary annotation in your prometheus
alert.

There is not a provision to handle more complex messages (not desired or
planned).

## Test it

To send a call to phone +XXXYYYYYYY use the following command (please
notice `%2B` symbols, representing a url encoded `+` sign).


```bash
$ curl -H "Content-Type: application/json" -X POST -d \
'{"version":"4","status":"firing","alerts":[{"annotations":{"summary":"Server down"},"startsAt":"2016-03-19T05:54:01Z"}]}' \
http://localhost:4000/call?receiver=%2bXXXYYYYYYY
```

## Install

Edit `examples/alert2twcall.default` to suit your environment.

Then:

```sh
$ make build # downloads npm deps
$ sudo make install # cp to /usr/local/alert2twcall
$ sudo make install_systemd # to set for systemd startup
# service alert2twcall start
```

## Acknowledgments

[promtotwilio](https://github.com/Swatto/promtotwilio) for reference /
inspiration about the api. This program objective is to present more or less the
same interface.
