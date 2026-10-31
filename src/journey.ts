export const clamp = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function smoothRange(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}

/** Shared by the camera and geometry: seeking backwards never depends on previous frames. */
export function journeyState(value: number) {
  const p = clamp(value);
  // The first half retains the complete original journey and its scroll distance.
  const original = clamp(p * 2);
  const departure = smoothRange(.5, .56, p);
  const finale = smoothRange(.95, .985, p);
  return {
    progress: p,
    original,
    departure,
    circuit: smoothRange(.15, .4, original),
    logic: smoothRange(.43, .68, original),
    resolve: smoothRange(.77, .97, original),
    intro: 1 - smoothRange(.08, .22, original),
    power: smoothRange(.19, .27, original) * (1 - smoothRange(.41, .49, original)),
    textLogic: smoothRange(.48, .56, original) * (1 - smoothRange(.73, .81, original)),
    outro: Math.max(smoothRange(.83, .92, original) * (1 - smoothRange(.5, .54, p)), finale),
    wave: departure * (1 - smoothRange(.82, .87, p)),
    assembly: smoothRange(.625, .715, p),
    textWave: smoothRange(.55, .58, p) * (1 - smoothRange(.635, .665, p)),
    tunnel: departure * (1 - smoothRange(.82, .87, p)),
    travel: smoothRange(.715, .86, p),
    textTunnel: smoothRange(.705, .735, p) * (1 - smoothRange(.79, .82, p)),
    network: smoothRange(.82, .88, p),
    textNetwork: smoothRange(.855, .885, p) * (1 - smoothRange(.925, .95, p)),
    finale,
  };
}
