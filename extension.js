
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const Meta = imports.gi.Meta;

let panel,
    panelBinding,
    lastScroll,
    scrollDelay;

function init() {
  panel = Main.panel;
  panelBinding = null;
  lastScroll = Date.now();
  scrollDelay = 200; // TODO: Take this from pref.
}

function enable() {
  panel.reactive = true;
  if (panelBinding) {
    disable();
  }
  panelBinding = panel.actor.connect('scroll-event',_onScroll);
}

function disable() {
  if (panelBinding) {
    panel.actor.disconnect(panelBinding);
    panelBinding = null;
  }
}

function _onScroll(actor, event) {
  let source = event.get_source();
  if (source != actor) {
    let inStatusArea = panel._rightBox && panel._rightBox.contains && panel._rightBox.contains(source);
    if (inStatusArea) {
      return Clutter.EVENT_PROPAGATE;
    }
  }

  let motion;
  switch(event.get_scroll_direction()) {
    case Clutter.ScrollDirection.UP:
      motion = Meta.MotionDirection.LEFT;
      break;
    case Clutter.ScrollDirection.DOWN:
      motion = Meta.MotionDirection.RIGHT;
      break;
    default:
      return Clutter.EVENT_PROPAGATE;
  }
  let activeWs;
  if (global.screen) {
  	activeWs = global.screen.get_active_workspace();
  } else {
  	activeWs = global.workspaceManager.get_active_workspace();
  }
  let ws = activeWs.get_neighbor(motion);
  if(!ws) return Clutter.EVENT_STOP;

  let currentTime = Date.now();
  if (currentTime < lastScroll + scrollDelay) {
    if(currentTime<lastScroll) {
      lastScroll = 0;
    }
    else {
      return Clutter.EVENT_STOP;
    }
  }

  lastScroll = currentTime;
  Main.wm.actionMoveWorkspace(ws);
  return Clutter.EVENT_STOP;
}
