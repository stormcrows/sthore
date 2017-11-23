# sthore

[![CircleCI](https://circleci.com/gh/stormcrows/sthore/tree/master.svg?style=svg)](https://circleci.com/gh/stormcrows/sthore/tree/master)

Generator powered store/dispatcher; supports custom middlewares and action listeners.
Comes with action loader in the package.

## USAGE

Refer to **sthore.spec.js** 

```javascript
const { Sthore, STATE_CHANGED } = require("sthore");

const initialState = {};
const sthore = Sthore(initialState);

// middlewares
// are special functions that get called on every action dispatch

// pre will get called before any of the actions are processed
sthore.use("pre", (actionName, payload) => {
    console.log("pre-middleware logger", action, payload)
});

// post are called right after all actions have been processed
sthore.use("post", (actionName, payload) => {
    console.log("post-middleware logger", action, payload)
});

// state changed action

sthore.on(STATE_CHANGED, ({ key, value, oldValue }) => {
    console.log("state changed: ", key, value, oldValue);
});

// custom action

const actionName = "CustomAction";
const customAction = msg => console.log(msg);

sthore.on(actionName, customAction);

// we'll run pre middlewares, then all action listeners , then post middleware
sthore.dispatch(actionName, "custom payload!");

sthore.removeListener(actionName, customAction);

// action loader

const { actionLoader } = require("sthore");
const actions = actionLoader("./actions/");

Object.keys(actions).forEach(name => sthore.on(name, actions[name]));
```
