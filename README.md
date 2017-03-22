# Jsonfig - A simple and flexible configuration loader.

```javascript
var api = require('yolapi');
var session = new api.session(
    'https://some-environment.rainbird.ai', // The environment you're targetting.
    '0648bb21-9fce-4ec7-ae4e-917fa4c2a7ee', // Your Api key.
    '3261cf53-06d3-4690-9e0e-f54788d57fe5'  // The knowledge-map ID.
);

var injectData = [
    {subject:'Bob', relationship:'lives in', object:'England'}
];

var queryData = {subject:'Bob', relationship:'speaks', object:null};

session.start(function(err, result) {
    if (err) throw (err);

    session.inject(injectData, function(err, result) {
        if (err) throw (err);

        session.query(queryData, function(err, result) {
            if (err) throw (err);
            // Write out the response from Rainbird.
            console.log(JSON.stringify(result, null, 3));
        });
    });
});
```
