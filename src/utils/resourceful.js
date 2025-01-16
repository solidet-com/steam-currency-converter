const EVENT_PREFIX_FROM_PAGE = "steamcc-from-page";
const EVENT_PREFIX_TO_PAGE = "steamcc-to-page";

const EVENTS = {
  GET_PAGE_VAR: "get-page-var",
  SCRIPT_LOADED: "script-loaded",
};

const get = (obj, path) => {
  const parts = path.split(".");
  return parts.reduce((acc, part) => acc ? acc[part] : null, obj)
};

window.addEventListener(EVENT_PREFIX_TO_PAGE, (event) => {
  const { type, data } = JSON.parse(event.detail);

  if (type?.startsWith(EVENT_PREFIX_TO_PAGE)) {
    const [_prefix, eventName] = type.split(":");

    switch (eventName) {
      case EVENTS.GET_PAGE_VAR:
        window.postMessage(
          {
            type: `${EVENT_PREFIX_FROM_PAGE}:${EVENTS.GET_PAGE_VAR}`,
            data: {
              resourceId: data.resourceId,
              payload: JSON.stringify(get(window, data.key)),
            },
          },
          "*"
        );
        break;
    }
  }
});

window.postMessage(
  { type: `${EVENT_PREFIX_FROM_PAGE}:${EVENTS.SCRIPT_LOADED}` },
  "*"
);

