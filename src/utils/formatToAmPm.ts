export function formatToAmPm(timeString: string): string {
  if (!timeString || !/^\d{2}:\d{2}/.test(timeString)) {
    return timeString; // Devuelve el original si el formato no es válido
  }

  const [hourStr, minuteStr] = timeString.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12; // Convierte la hora a formato de 12 horas (0 se convierte en 12)

  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}
