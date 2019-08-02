# YolApi - An example API wrapper for Rainbird's inference engine.

Example which injects a fact:

```javascript
const api = require('@rainbird/yolapi');
const session = new api.session(
    'https://some-environment.rainbird.ai', // The environment you're targetting.
    '0648bb21-9fce-4ec7-ae4e-917fa4c2a7ee', // Your Api key.
    '3261cf53-06d3-4690-9e0e-f54788d57fe5'  // The knowledge-map ID.
);

const injectData = [
    {subject:'Bob', relationship:'lives in', object:'England'}
];

const queryData = { subject:'Bob', relationship:'speaks', object: null };

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

Example which initially answers a question and then goes back using undo:

```javascript
const api = require('@rainbird/yolapi');
const session = new api.session(
    'https://some-environment.rainbird.ai', // The environment you're targetting.
    '0648bb21-9fce-4ec7-ae4e-917fa4c2a7ee', // Your Api key.
    '3261cf53-06d3-4690-9e0e-f54788d57fe5'  // The knowledge-map ID.
);

const responseData = {
    answers: [{ subject: 'Bob', relationship: 'lives in', object: 'England' , cf: 100 }]
};

const queryData = { subject:'Bob', relationship:'speaks', object: null };

session.start(function(err, result) {
    if (err) throw (err);

    session.query(queryData, function(err, result) {
        if (err) throw (err);

        session.respond(responseData, function(err, result) {
            if (err) throw (err);
            
            session.undo(function(err, result) {
                if (err) throw (err);
    
                // Write out the response from Rainbird.
                console.log(JSON.stringify(result, null, 3));
            });
        });
    });
});
```

