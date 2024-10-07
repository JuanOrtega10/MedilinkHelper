// popup.js

document.addEventListener("DOMContentLoaded", () => {
    const uploadAllPatientsButton = document.getElementById("uploadAllPatients");
    const uploadLast7DaysButton = document.getElementById("uploadLast7Days");
    const uploadLast30DaysButton = document.getElementById("uploadLast30Days");
  
    uploadAllPatientsButton.addEventListener("click", () => {
      disableButtons(true);
      uploadPatients(0)
        .then(() => {
          showNotification("Proceso completado.", "success");
        })
        .catch((error) => {
          console.error("Error al subir pacientes:", error);
          showNotification("Error al subir pacientes: " + error.message, "error");
        })
        .finally(() => {
          disableButtons(false);
        });
    });
  
    uploadLast7DaysButton.addEventListener("click", () => {
      disableButtons(true);
      uploadPatients(7)
        .then(() => {
          showNotification("Proceso completado.", "success");
        })
        .catch((error) => {
          console.error("Error al subir pacientes:", error);
          showNotification("Error al subir pacientes: " + error.message, "error");
        })
        .finally(() => {
          disableButtons(false);
        });
    });
  
    uploadLast30DaysButton.addEventListener("click", () => {
      disableButtons(true);
      uploadPatients(30)
        .then(() => {
          showNotification("Proceso completado.", "success");
        })
        .catch((error) => {
          console.error("Error al subir pacientes:", error);
          showNotification("Error al subir pacientes: " + error.message, "error");
        })
        .finally(() => {
          disableButtons(false);
        });
    });
  
    function disableButtons(disable) {
      uploadAllPatientsButton.disabled = disable;
      uploadLast7DaysButton.disabled = disable;
      uploadLast30DaysButton.disabled = disable;
    }
  
    async function uploadPatients(daysAgo) {
      try {
        // Paso 1: Obtener las cookies de Medilink
        const cookiesResponse = await getMedilinkCookies();
        const cookies = cookiesResponse.cookies;
  
        // Paso 2: Obtener los datos de Google Sheets
        const patientData = await fetchPatientData();
  
        // Paso 3: Filtrar pacientes según la opción seleccionada
        const filteredPatients = filterPatientsByDate(patientData, daysAgo);
  
        if (filteredPatients.length === 0) {
          showNotification("No hay pacientes para subir en el rango seleccionado.", "warning");
          return;
        }
  
        // Paso 4: Procesar y subir cada paciente
        await processAndUploadPatients(filteredPatients, cookies);
      } catch (error) {
        throw error;
      }
    }
  
    function getMedilinkCookies() {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "getMedilinkCookies" }, (response) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          resolve(response);
        });
      });
    }
  
    function fetchPatientData() {
      return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError || !token) {
            reject(new Error("Error al obtener el token de autenticación."));
            return;
          }
  
          const spreadsheetId = '1qyNYgQIhi4th8slT-XL7U18BJeYfmTtP5WyP-ndzl1o'; // Reemplaza con tu ID de Spreadsheet
          const range = 'Respuestas de formulario 1'; // Ajusta el rango según tus necesidades
  
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  
          fetch(url, {
            headers: {
              'Authorization': 'Bearer ' + token,
            }
          })
            .then(response => response.json())
            .then(data => {
              const patientData = parseSheetData(data);
              resolve(patientData);
            })
            .catch(error => {
              reject(error);
            });
        });
      });
    }
  
    function parseSheetData(data) {
      const rows = data.values;
      const headers = rows[0];
      const patientData = [];
  
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const patient = {};
        for (let j = 0; j < headers.length; j++) {
          patient[headers[j]] = row[j] || '';
        }
        patientData.push(patient);
      }
  
      return patientData;
    }
  
    function filterPatientsByDate(patientsData, daysAgo) {
      if (daysAgo === 0) {
        return patientsData;
      }
  
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
  
      return patientsData.filter(patient => {
        const timestamp = patient['Marca temporal'];
        const date = parseDate(timestamp);
        return date >= cutoffDate;
      });
    }
  
    function parseDate(dateString) {
      const parts = dateString.split(' ');
      const dateParts = parts[0].split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Meses en JavaScript van de 0 a 11
        const year = parseInt(dateParts[2], 10);
        return new Date(year, month, day);
      }
      return null;
    }
  
    async function processAndUploadPatients(patientsData, cookies) {
      const processor = new Processor();
    
      for (const patient of patientsData) {
        let message = '';
        let type = '';
    
        // Asigna valores por defecto si faltan los campos de nombre o apellido
        const firstName = patient['Primer Nombre'] || 'Nombre no disponible';
        const lastName = patient['Primer Apellido'] || 'Apellido no disponible';
    
        try {
          const formattedPayload = processPatientData(patient, processor);
    
          // Envía la solicitud POST
          const response = await fetch('https://saludfeet.app.softwaremedilink.com/clientes/crear', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Cookie': cookies,
            },
            body: formattedPayload,
          });
    
          const responseText = await response.text();
    
          // Verifica primero si el paciente ya está registrado
          const alreadyRegistered = responseText.includes("El paciente ya existe en la base de datos");
          const success = responseText.includes("<script>window.location = 'https://saludfeet.app.softwaremedilink.com/clientes/ver/");
          const error = responseText.includes("!DOCTYPE html PUBLIC");
    
          if (alreadyRegistered) {
            message = `Paciente ${firstName} ${lastName} ya existe en la base de datos.`;
            type = 'warning';
          } else if (success) {
            message = `Paciente ${firstName} ${lastName} fue creado exitosamente.`;
            type = 'success';
          } else if (error) {
            message = `Ocurrió un error al procesar al paciente ${firstName} ${lastName}.`;
            type = 'error';
          } else {
            message = `Ocurrió un error inesperado con el paciente ${firstName} ${lastName}.`;
            type = 'error';
          }
    
        } catch (error) {
          message = `Error al procesar al paciente ${firstName} ${lastName}: ${error.message}`;
          type = 'error';
        }
    
        // Inyecta el archivo contentScript.js y llama a showNotification
        injectScriptAndNotify(message, type);
      }
    }
    
    // Función para inyectar el contentScript.js y luego llamar a showNotification
    function injectScriptAndNotify(message, type) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['js/contentScript.js']
        }, () => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (msg, type) => {
              showNotification(msg, type);
            },
            args: [message, type]
          });
        });
      });
    }
    
    
    // Función para inyectar el contentScript.js y luego llamar a showNotification
    function injectScriptAndNotify(message, type) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['js/contentScript.js']
        }, () => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (msg, type) => {
              showNotification(msg, type);
            },
            args: [message, type]
          });
        });
      });
    }
    
    
  
    function processPatientData(patient, processor) {
      // Procesar fecha de nacimiento
      const fechaNacimiento = processor.preProcessDate(patient['Fecha de Nacimiento']);
      let dia = '', mes = '', ano = '';
      if (fechaNacimiento) {
        dia = fechaNacimiento.getDate().toString().padStart(2, '0');
        mes = (fechaNacimiento.getMonth() + 1).toString().padStart(2, '0');
        ano = fechaNacimiento.getFullYear().toString();
      }
  
      const payload = {
        'nombre': processor.processNombre(patient['Primer Nombre'], patient['Segundo Nombre']),
        'cf_41': '',
        'apellidos': processor.processNombre(patient['Primer Apellido'], patient['Segundo Apellido']),
        'cf_2': ID_MAPPING[patient['Tipo de Documento']] || '',
        'cf_39': processor.processCountry(patient['Nacionalidad']),
        'rut': patient['Número de Documento de Identidad'],
        'nombre_social': '',
        'sexo': processor.processSexo(patient['Sexo']),
        'id_genero': '',
        'dia': dia,
        'mes': mes,
        'ano': ano,
        'cf_7': '',
        'cf_28': processor.processGrupoSanguineo(patient['Grupo Sanguíneo']),
        'cf_8': '',
        'cf_17': '',
        'cf_6': '',
        'actividad': patient['Ocupación'],
        'cf_1': 4,
        'id_tipo_paciente': '',
        'cf_16': 'empty',
        'mail': patient['Dirección de correo electrónico'],
        'direccion': patient['Dirección de Residencia'],
        'cf_3': '11-001',
        'cf_5': 'U',
        'telefono': '',
        'celular': patient['Celular'],
        'cf_18': patient['Nombre Contacto de Emergencia'],
        'cf_19': patient['Celular Contacto de Emergencia'],
        'cf_20': patient['Nombre Contacto de Emergencia'],
        'cf_21': patient['Celular Contacto de Emergencia'],
        'cf_22': patient['Parentesco'],
        'convenio': '0',
        'observaciones': processor.processObservaciones(
          patient['Motivo Consulta'],
          patient['Enfermedades Preexistentes'],
          patient['Medicamentos Actuales'],
          patient['Alergias a Medicamentos']
        ),
        'cf_38': '',
        'cf_40': '',
        'ciudad': 'Bogotá, D.C.',
        'comuna': 'Bogotá, D.C.',
      };
  
      // Codifica el payload en formato application/x-www-form-urlencoded
      const formattedPayload = new URLSearchParams(payload).toString();
  
      return formattedPayload;
    }
  
  });
  