export const clamp = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function smoothRange(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}

/** Shared by the camera and geometry: seeking backwards never depends on previous frames. */
export function journeyState(value: number) {
  const p = clamp(value);
  return {
    progress: p,
    circuit: smoothRange(.15, .4, p),
    logic: smoothRange(.43, .68, p),
    resolve: smoothRange(.77, .97, p),
    intro: 1 - smoothRange(.08, .22, p),
    power: smoothRange(.19, .27, p) * (1 - smoothRange(.41, .49, p)),
    textLogic: smoothRange(.48, .56, p) * (1 - smoothRange(.73, .81, p)),
    outro: smoothRange(.83, .92, p),
  };
}
