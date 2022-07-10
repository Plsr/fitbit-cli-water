# fitbit-cli-water

## Authenticating

Fitbit requires the callback server to run on https (and rightfully so). In order to do so, we need two files in the
root folder of the project:

- `cert.pem`
- `key.pem`

In order to generate those, run:

```shell
openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365
```

and then

```shell
openssl rsa -in keytmp.pem -out key.pem
```

After giving permissions to the app, the redirect will tell you that the certificates are not trusted (since you just
generated them youself). Go to advenced and accept the security-risk.
