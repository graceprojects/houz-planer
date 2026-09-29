/** Temporary hand tool. Always release it when focus leaves the application. */
export function bindSpacePan(
  keyboard: EventTarget,
  visibility: EventTarget & {hidden: boolean},
  blocked: (target: EventTarget | null) => boolean,
  change: (held: boolean) => void,
) {
  let held = false;
  const set = (value: boolean) => { if (held !== value) { held = value; change(value); } };
  const stop = () => set(false);
  const down = (event: Event) => {
    const e = event as KeyboardEvent;
    if (e.code !== 'Space' || blocked(e.target)) return;
    e.preventDefault();
    if (!e.repeat) set(true);
  };
  const up = (event: Event) => {
    const e = event as KeyboardEvent;
    if (e.code === 'Space') { if (held) e.preventDefault(); stop(); }
  };
  const hide = () => { if (visibility.hidden) stop(); };
  keyboard.addEventListener('keydown', down);
  keyboard.addEventListener('keyup', up);
  keyboard.addEventListener('blur', stop);
  visibility.addEventListener('visibilitychange', hide);
  return () => {
    keyboard.removeEventListener('keydown', down);
    keyboard.removeEventListener('keyup', up);
    keyboard.removeEventListener('blur', stop);
    visibility.removeEventListener('visibilitychange', hide);
  };
}
