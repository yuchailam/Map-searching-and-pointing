import { isRef, watch, unref, onMounted, onBeforeUnmount } from 'vue';
// addEventListener to a Node , eg: div.addEventListener("click", ()=>)

export const useEventListener = (target, event, handler: (e: MouseEvent) => void) => {
  if (isRef(target)) {
    watch(target, (value: Element, oldValue: Element) => {
      oldValue?.removeEventListener(event, handler);
      value?.addEventListener(event, handler);
    });
  } else {
    onMounted(() => {
      target.addEventListener(event, handler);
    });
  }
  onBeforeUnmount(() => {
    unref(target)?.removeEventListener(event, handler);
  });
};

// if target is clicked, trigger the handler(e: Event)
// useClickAway(ref, (e)=>{})
export const useClickAway = (target: Element, handler) => {
  if (typeof window === 'undefined' || !window) return;

  const listener = (e: Event) => {
    const el = unref(target); // turn it to normal DOM node
    if (!el) return;

    // Click inside
    if (el === e.target || e.composedPath().includes(el)) return;

    handler(e);
  };
  // $(window).click(function() {
  //   //Hide the menus if visible
  // });
  return useEventListener(window, 'pointerdown', listener);
};
