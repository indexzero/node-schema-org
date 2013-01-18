# node-schema-org

A node.js library that retrieves, parses and provides all schemas from schema.org

## Installation

### Installing npm (node package manager)
```
  curl http://npmjs.org/install.sh | sh
```

### Installing node-schema-org
```
  [sudo] npm install schema-org
```

## Motivation
Although there is some debate from the W3C et al right now, when I came across [schema.org][0] I thought: "wow, what a gold mine of potential data formats to use in my applications." Then I looked at the site and thought: **"Y U NO GIVE ME JSON FORMAT!?!?!"** So I wrote this. It uses some other awesome node.js libraries:

* [jsdom](http://github.com/tmpvar/jsdom): CommonJS implementation of the DOM intended to be platform independent and as minimal/light as possible while completely adhering to the w3c DOM specifications.
* [neuron](http://github.com/indexzero/neuron): The simplest possible event driven job manager, FIFO queue, and "task based cache" in node.js
* [optimist](http://github.com/substack/node-optimist): Light-weight option parsing for node.js
* [request](http://github.com/mikeal/request): Simplified HTTP request client.
* [winston](http://github.com/indexzero/winston): A multi-transport async logging library for node.js

## Usage
Right now, `node-schema-org` is implemented as a bin script which can be run after you install this module: 

``` bash
  $ read-schema-org
```

Here is a sample of the output (all of the pre-parsed schemas are available [here](http://github.com/indexzero/node-schema-org/tree/master/schemas)): 

```
  warn:   Removing all schemas in /path/to/node-schema-org/schemas
  info:   Spawning: node /path/to/node-schema-org/list-schemas.js
  info:   Contacting: http://schema.org/docs/full.html
  info:   Parsing: http://schema.org/docs/full.html
  info:   Reading: http://schema.org/docs/full.html
  info:   Saving results to: /path/to/node-schema-org/schemas/schema-list.json
  info:   Done creating /path/to/node-schema-org/schemas/schema-list.json from http://schema.org/docs/full.html
  info:   node /path/to/node-schema-org/list-schemas.js has exited.
  info:   Spawning: node /path/to/node-schema-org/read-schema.js --type DataType
  info:   Spawning: node /path/to/node-schema-org/read-schema.js --type Boolean
  info:   Spawning: node /path/to/node-schema-org/read-schema.js --type Date
  (....)
  info:   Parsing Type: Place
  info:   Parsing Type: Organization
  info:   Parsing Type: LocalBusiness
  info:   Writing schema: /path/to/node-schema-org/schemas/localbusiness.json
  info:   Done parsing schema: /path/to/node-schema-org/schemas/localbusiness.json
  info:   node /path/to/node-schema-org/read-schema.js --type LocalBusiness has exited.
  info:   
  info:   Done parsing all schemas from schema.org
  info:   They are located in: /path/to/node-schema-org/schemas
  info:   
```

## Sample Schema 

``` js
  {
    "type": "Place",
    "bases": {
      "Thing": [
        {
          "name": "description",
          "description": "A short description of the item.",
          "type": "Text"
        },
        {
          "name": "image",
          "description": "URL of an image of the item.",
          "type": "URL"
        },
        {
          "name": "name",
          "description": "The name of the item.",
          "type": "Text"
        },
        {
          "name": "url",
          "description": "URL of the item.",
          "type": "Text"
        }
      ]
    },
    "properties": [
      {
        "name": "address",
        "description": "Physical address of the item.",
        "type": "PostalAddress"
      },
      {
        "name": "aggregateRating",
        "description": "The overall rating, based on a collection of reviews or ratings, of the item.",
        "type": "AggregateRating"
      },
      {
        "name": "containedIn",
        "description": "The basic containment relation between places.",
        "type": "Place"
      },
      {
        "name": "events",
        "description": "The events held at this place or organization.",
        "type": "Event"
      },
      {
        "name": "faxNumber",
        "description": "The fax number.",
        "type": "Text"
      },
      {
        "name": "geo",
        "description": "The geo coordinates of the place.",
        "type": "GeoCoordinates"
      },
      {
        "name": "interactionCount",
        "description": "A count of a specific user interactions with this item—for example, 20 UserLikes, 5 UserComments, or 300 UserDownloads. The user interaction type should be one of the sub types of UserInteraction.",
        "type": "Text"
      },
      {
        "name": "maps",
        "description": "A URL to a map of the place.",
        "type": "Text"
      },
      {
        "name": "photos",
        "description": "Photographs of this place.",
        "type": [
          "Photograph",
          "ImageObject"
        ]
      },
      {
        "name": "reviews",
        "description": "Review of the item.",
        "type": "Review"
      },
      {
        "name": "telephone",
        "description": "The telephone number.",
        "type": "Text"
      }
    ]
  }
```

#### Author: [Charlie Robbins][0]
#### License: MIT

[0]: http://blog.nodejitsu.com