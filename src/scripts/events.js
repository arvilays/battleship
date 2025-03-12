export default (function () {
  let events = {};

  const subscribe = (eventName, fn) => {
    events[eventName] = events[eventName] || [];
    events[eventName].push(fn);
  };

  const unsubscribe = (eventName, fn) => {
    if (events[eventName]) {
      for (var i = 0; i < events[eventName].length; i++) {
        if (events[eventName][i] === fn) {
          events[eventName].splice(i, 1);
          break;
        }
      }
    }
  };

  const trigger = (eventName, ...data) => {
    if (events[eventName]) {
      events[eventName].forEach(function (fn) {
        fn(...data);
      });
    }
  };

  return { subscribe, unsubscribe, trigger };
})();
