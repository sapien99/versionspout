# Dockerss

News about your docker images.

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
    "email" : "michael.ferjancic@gmail.com", 
    "htmlEmail" : false, 
    "notificationChannels" : [
        {
            "name" : "mail"
        }, 
        {
            "name" : "webhook1", 
            "type" : "webhook", 
            "config" : {
                "url" : "http://localhost.com:3001/"
            }
        }
    ], 
    "subscribedDockerVersions" : [
        {
            "notificationChannels" : [

            ], 
            "ignorePatterns" : [
                "development", 
                "latest", 
                "master", 
                ".*rc.*"
            ], 
            "semverRange" : ">2.7", 
            "repository" : "prom", 
            "image" : "prometheus", 
            "tag" : "2.2.0"
        }
    ]
}
```

## Docker

### Build
```
docker build -t vernotify .
```