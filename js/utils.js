// utils.js

const ID_MAPPING = {
    "Cédula de Ciudadanía": "CC",
    "Cédula de Extranjería": "CE",
    "Tarjeta de Identidad": "TI",
    "Registro Civil": "RC",
    "Pasaporte": "PA",
    "Permiso especial de permanencia": "PE",
    // Agrega otros mapeos si es necesario
  };
  
  const HEADERS = {
    'accept': '*/*',
    'accept-language': 'es,en-US;q=0.9,en;q=0.8,es-CO;q=0.7,es-419;q=0.6',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'origin': 'https://saludfeet.app.softwaremedilink.com',
    'priority': 'u=1, i',
    'referer': 'https://saludfeet.app.softwaremedilink.com/clientes/nuevo',
    'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest'
  };
  
  function isNoneOrNaN(value) {
    return value === null || value === undefined || value === '';
  }
