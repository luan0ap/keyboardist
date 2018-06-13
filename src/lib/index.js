import isInputEvent from "./is-input-event";
import isEventModifier from "./is-event-modifier";
import getKeyEventName from "./get-key-event-name";

const defaultMonitor = eventName => {
  console.log(":keyboard event:", eventName);
};

function createListener(listenForEvent = "keydown") {
  let allListeners = {};

  let __monitor__ = null;

  // listens to the event and fires the appropiate event subscription
  function handleKeyEvent(event) {
    if (isEventModifier(event)) {
      return;
    }

    if (isInputEvent(event)) {
      return;
    }

    const eventName = getKeyEventName(event);

    const listeners = allListeners[eventName.toLowerCase()] || [];

    if (typeof __monitor__ === "function") {
      const matched = listeners.length > 0;
      __monitor__(eventName, matched, event);
    }

    if (listeners.length) {
      event.preventDefault();
    }

    // flag to tell if execution should continue;
    let propagate = true;
    //
    for (let i = listeners.length - 1; i >= 0; i--) {
      if (listeners[i]) {
        propagate = listeners[i]();
      }
      if (propagate === false) {
        break;
      }
    }
    // listeners.map(listener => listener());
  }

  // creates a subscription
  // returns the unsubscribe function;
  function subscribe(eventName, callback) {
    // the keys are lowercased so both 'Shift+Space' and 'shift+space' works.
    eventName = eventName.toLowerCase();
    // remove spaces so both 'Shift + Space' and 'shift+space' works.
    eventName.replace(/\s/, "");

    if (typeof allListeners[eventName] === "undefined") {
      allListeners[eventName] = [];
    }
    allListeners[eventName].push(callback);
    return {
      unsubscribe: () => {
        const index = allListeners[eventName].indexOf(callback);
        allListeners[eventName].splice(index, 1);
      },
    };
  }

  // alows to set a monitor function that will run on every event
  function setMonitor(monitor = null) {
    if (monitor === true) {
      __monitor__ = defaultMonitor;
    } else {
      __monitor__ = monitor;
    }
  }

  // adds the event listener to the document
  function startListening() {
    document.addEventListener(listenForEvent, handleKeyEvent);
  }

  // removes the event listener from the document
  function stopListening() {
    document.removeEventListener(listenForEvent, handleKeyEvent);
  }

  startListening();

  return { subscribe, setMonitor, startListening, stopListening };
}

export default createListener;
