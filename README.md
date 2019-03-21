# Versionspout

News about docker images and github releases.

## Start

### Prerequisites
Mongodb for holding the profiles and the state.

### Build
```
npm run prestart:prod
npm run test
```

### Start application
Install modules and start application
```
npm i
npm run start
```

# Objects
## the Userprofile
Userprofile contains the docker images you are interested in, as well as the channels you wanted to be nofified with. You can filter several patterns for ignoring nightly builds etc. - or you can use semver-checking and specify a semver range to check for new tags. The moment you specify a semver pattern all tags NOT matching the semver range are automatically ignored.

```
{ 
    "defaults" : {
        "notificationChannels" : [
            "webhook1"
        ]
    }, 
    "email" : "someone@gmail.com", 
    "htmlEmail" : false, 
    "notificationChannels" : [
        {
            "name" : "mail"
        }, 
        {
            "name" : "some-webhook", 
            "type" : "webhook", 
            "config" : {
                "url" : "http://localhost.com:3001/"
            }
        }
    ], 
    "subscribedVersions" : [
        {
            "notificationChannels" : [
               "some-webhook"
            ], 
            "drop" : [
                "development", 
                "latest", 
                "master", 
                ".*rc.*"
            ], 
            "filter": {
              "semver" : ">2.7", 
            },
            "subject" : "prom/prometheus" 
        }
    ]
}
```

## Docker

### Build
```
docker build -t versionspout .
```
