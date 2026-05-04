export const volumeOptions = [
  {
    value: "0-10",
    label: "0 bis 10 Angebote pro Monat",
    packageLabel: "Starter",
    summary: "Sinnvoll für den Einstieg und kleinere offene Volumen.",
  },
  {
    value: "10-20",
    label: "10 bis 20 Angebote pro Monat",
    packageLabel: "Standard",
    summary: "Die passende Stufe für den laufenden Alltag mit regelmäßigem Nachfassbedarf.",
  },
  {
    value: "20-plus",
    label: "Mehr als 20 Angebote pro Monat",
    packageLabel: "Wachstum",
    summary: "Für Betriebe mit dauerhaft hohem Angebotsaufkommen und vielen parallelen Vorgängen.",
  },
];

export function getVolumeOption(value) {
  return volumeOptions.find((item) => item.value === value) || null;
}
