export const volumeOptions = [
  {
    value: "0-10",
    label: "0 bis 10 Angebote pro Monat",
    packageLabel: "Starter",
    summary: "Gut für Einstieg und Test.",
  },
  {
    value: "10-20",
    label: "10 bis 20 Angebote pro Monat",
    packageLabel: "Standard",
    summary: "Das Hauptangebot für die meisten Betriebe.",
  },
  {
    value: "20-plus",
    label: "Mehr als 20 Angebote pro Monat",
    packageLabel: "Wachstum",
    summary: "Für Betriebe mit vielen offenen Angeboten und dauerhaft laufendem Volumen.",
  },
];

export function getVolumeOption(value) {
  return volumeOptions.find((item) => item.value === value) || null;
}
