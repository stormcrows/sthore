const co = require("co");

const STATE_CHANGED = "STATE_CHANGED";

function Sthore(state = {}) {
  /**
   * @param {string} actionName 
   * @param {any} payload 
   */
  const dispatch = (actionName, payload) =>
    runMiddlewares("pre", actionName, payload)
      .then(() => runActions(actionName, payload))
      .then(() => runMiddlewares("post", actionName, payload));

  // MIDDLEWARE

  const middlewares = {
    pre: [],
    post: []
  };

  /**
   * 
   * @param {"pre"|"post"} type 
   * @param {(actionName: "string", payload: any, state: any)} middleware 
   */
  const use = (type, middleware) =>
    (type === "pre" || type === "post") && middlewares[type].push(middleware);

  /**
   * 
   * @param {"pre" | "post"} type 
   * @param {string} actionName 
   * @param {any} payload 
   */
  const runMiddlewares = (type, actionName, payload) => {
    const list = middlewares[type];
    return list
      ? co(middlewareRunner, list, { actionName, payload })
      : Promise.reject(`wrong middleware type ${type}`);
  };

  /**
   * 
   * @param {[]} list 
   * @param {{}} props 
   */
  function* middlewareRunner(list, props = {}) {
    for (let i = 0; i < list.length; i += 1) {
      try {
        yield co(list[i](Object.assign({ state }, props)));
      } catch (err) {
        yield Promise.reject(err);
      }
    }
  }

  // ACTIONS

  const actions = {};

  /**
   * Attaches action listener.
   * @param {string} name 
   * @param {Function} action 
   */
  const on = (name, action) => {
    if (!name || typeof action !== "function") return false;
    actions[name] = actions[name] || [];
    actions[name].push(action);
    return true;
  };

  /**
  * Removes action listener.
  * @param {string} name 
  * @param {Function} action 
  */
  const removeListener = (name, action) => {
    if (!name || typeof action !== "function") return false;
    const idx = actions[name] ? actions[name].findIndex(a => a === action) : -1;
    return idx > -1 ? !!actions[name].splice(0, 1) : false;
  };

  /**
   * 
   * @param {string} actionName 
   * @param {any} payload 
   */
  const runActions = (actionName, payload) => {
    const list = actions[actionName];
    return list
      ? co(actionRunner, list, payload)
      : Promise.reject(`unsupported [A] ${actionName}`);
  };

  /**
   * 
   * @param {[]} list 
   * @param {any} payload 
   */
  function* actionRunner(list, payload) {
    for (let i = 0; i < list.length; i += 1) {
      try {
        yield co(list[i](payload));
      } catch (err) {
        yield Promise.reject(err);
      }
    }
  }

  // STATE

  /**
   * Sets value under a key, and dispatches STATE_CHANGED with the update.
   * @param {string} key 
   * @param {any} value 
   */
  const setState = (key, value) => {
    if (typeof key === "string" && state[key] !== value) {
      const oldValue = state[key];
      state[key] = value;
      dispatch(STATE_CHANGED, { key, oldValue, value });
    }
  };

  /**
   * Returns value for the provided key or the whole state if no key specified.
   * @param {string} key 
   */
  const getState = key => (key ? state[key] : state);

  // avoid unsupported [A] error
  on(STATE_CHANGED, () => {});

  return {
    dispatch,
    use,
    setState,
    getState,
    on,
    removeListener
  };
}

module.exports = {
  Sthore,
  STATE_CHANGED
};
