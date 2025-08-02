/**
 * Valida el formato de una cédula venezolana.
 * El formato esperado es una 'V' o 'E' mayúscula al inicio,
 * seguida de 7 a 9 dígitos numéricos.
 * @param {string} cedula La cadena de texto de la cédula a validar.
 * @returns {boolean} Devuelve `true` si la cédula tiene el formato correcto, de lo contrario `false`.
 */
function validarCedula(cedula:string): boolean {
  // Aseguramos que la entrada sea una cadena de texto.
  if (typeof cedula !== 'string') {
    return false;
  }

  // Expresión regular que valida el formato.
  // ^[VE]: La cadena debe comenzar con 'V' o 'E'.
  // \d{7,9}: Debe ser seguida por 7, 8 o 9 dígitos.
  // $: La cadena debe terminar después de los dígitos.
  const regex = /^[VE]\d{7,9}$/;

  // Probamos la cadena de la cédula contra la expresión regular.
  return regex.test(cedula);
}

export default validarCedula;