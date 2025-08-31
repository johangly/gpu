function formatTimeWithoutSeconds(horaString: string) {
    // Verificamos si la cadena es válida y tiene el formato esperado.
    if (typeof horaString === 'string' && horaString.length >= 5) {
      // Usamos substring para obtener los primeros 5 caracteres (HH:MM).
      return horaString.substring(0, 5);
    }
    return horaString; // Retorna el valor original si no es un formato válido.
  }

  export default formatTimeWithoutSeconds;