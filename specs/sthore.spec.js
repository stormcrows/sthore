const { Sthore, STATE_CHANGED } = require("../lib/sthore");

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;
const randomWord = () =>
  [...Array(random(5, 15))]
    .map(() => String.fromCharCode(random(65, 92)))
    .join("");

let store;

beforeEach(() => {
  store = Sthore({});
});

describe("setState", () => {
  it("should cause dispatch STATE_CHANGED with payload and state", done => {
    const action = jest.fn();
    store.on(STATE_CHANGED, action);
    store.setState("key", "test");

    setTimeout(() => {
      expect(action).toHaveBeenCalledWith({
        key: "key",
        value: "test",
        oldValue: undefined
      });
      done();
    }, 1);
  });
});

describe("getState", () => {
  it("should return value for every added key", () => {
    const map = [...Array(random(100, 10000))].map(() => ({
      key: randomWord(),
      value: randomWord()
    }));

    map.forEach(({ key, value }) => store.setState(key, value));
    map.forEach(({ key, value }) => expect(store.getState(key)).toBe(value));
  });
});

describe("dispatch", () => {
  it("should work each time for all action types", () => {
    const N = random(5, 50);
    const actionName = randomWord();
    const payload = randomWord();
    const actions = [...Array(N)].map(() => jest.fn());

    actions.forEach(action => store.on(actionName, action));
    store
      .dispatch(actionName, payload)
      .then(() =>
        actions.forEach(action => expect(action).toHaveBeenCalledWith(payload))
      );
  });
});

describe("use", () => {
  it("should attach pre and post middlewares", () => {
    const calls = [];

    const preMiddleware = jest.fn(() => calls.push("pre"));
    const postMiddleware = jest.fn(() => calls.push("post"));

    const actionName = randomWord();
    const action = jest.fn(() => calls.push(actionName));

    store.on(actionName, action);
    store.use("post", postMiddleware);
    store.use("pre", preMiddleware);

    store
      .dispatch(actionName, "TEST!")
      .then(() => expect(calls).toEqual(["pre", actionName, "post"]));
  });
});

describe("removeListener", () => {
  it("should detach function from listening to action type", () => {
    const actionName = randomWord();
    const action = jest.fn();

    store.on(actionName, action);
    store.removeListener(actionName, action);
    store
      .dispatch(actionName, "TEST!")
      .then(() => expect(action).not.toHaveBeenCalled());
  });
});
