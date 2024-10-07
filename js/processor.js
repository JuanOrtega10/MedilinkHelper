// processor.js

class Processor {
    isNoneOrNaN(value) {
      return value === null || value === undefined || value === '';
    }
  
    preProcessDate(dateString) {
      /**
       * Preprocesa una cadena de fecha.
       */
      if (!dateString) return '';
      
      const formats = ['DD/MM/YYYY HH:mm:ss', 'DD/MM/YYYY'];
      for (const format of formats) {
        const date = this.parseDate(dateString, format);
        if (date) return date;
      }
      return '';
    }
  
    parseDate(dateString, format) {
      const parts = dateString.split(' ');
      const dateParts = parts[0].split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Meses en JavaScript van de 0 a 11
        const year = parseInt(dateParts[2], 10);
        const time = parts[1] || '';
        const date = new Date(year, month, day);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    }
  
    processNombre(primerNombre, segundoNombre) {
      if (!this.isNoneOrNaN(segundoNombre)) {
        return `${primerNombre} ${segundoNombre}`;
      } else {
        return primerNombre;
      }
    }
  
    processObservaciones(motivoConsulta, enfermedadesPreexistentes, medicamentosActuales, alergiasMedicamentos) {
      let observaciones = "";
      observaciones += `Motivo Consulta: ${!this.isNoneOrNaN(motivoConsulta) ? motivoConsulta : 'No especificado'} \n`;
      observaciones += `Enfermedades Preexistentes: ${!this.isNoneOrNaN(enfermedadesPreexistentes) ? enfermedadesPreexistentes : 'No especificado'} \n`;
      observaciones += `Medicamentos Actuales: ${!this.isNoneOrNaN(medicamentosActuales) ? medicamentosActuales : 'No especificado'} \n`;
      observaciones += `Alergias a Medicamentos: ${!this.isNoneOrNaN(alergiasMedicamentos) ? alergiasMedicamentos : 'No especificado'} \n`;
      return observaciones.trim();
    }
  
    processSexo(sexo) {
      const sexoMapping = {
        "Masculino": "M",
        "Femenino": "F"
      };
      const codigo = sexoMapping[sexo];
      if (this.isNoneOrNaN(codigo)) {
        throw new Error(`Sexo no encontrado: ${sexo}`);
      }
      return codigo;
    }
  
    processGrupoSanguineo(grupoSanguineo) {
      const grupoSanguineoMapping = {
        "O positivo (O+)": "O+",
        "A positivo (A+)": "A+",
        "A negativo (A-)": "A-",
        "B positivo (B+)": "B+",
        "B negativo (B-)": "B-",
        "O negativo (O-)": "O-",
        "AB positivo (AB+)": "AB+",
        "AB negativo (AB-)": "AB-"
      };
      const codigo = grupoSanguineoMapping[grupoSanguineo];
      if (this.isNoneOrNaN(codigo)) {
        throw new Error(`Grupo sanguíneo no encontrado: ${grupoSanguineo}`);
      }
      return codigo;
    }
  
    processCountry(countryName) {
      const countryMapping = {
        "Colombia": "COL",
        "Estados Unidos": "USA",
        "Venezuela": "VEN",
        "México": "MEX",
        "Perú": "PER",
        "Alemania": "DEU",
        "Ecuador": "ECU",
        "Brasil": "BRA",
        "Francia": "FRA",
        "España": "ESP",
        "Suecia": "SWE",
        "Costa Rica": "CRI"
      };
      const codigoPais = countryMapping[countryName.trim()];
      if (this.isNoneOrNaN(codigoPais)) {
        console.warn(`País no encontrado en el mapeo: ${countryName}. Se usará el valor predeterminado "null".`);
        return null;
      }
      return codigoPais;
    }
  
    processCity(cityName) {
      const ciudadMapping = {
        "Bogotá": "2",
        "Cali": "1",
        "Medellín": "3",
        "Barranquilla": "98",
        "Villavicencio": "1093"
      };
      let codigoCiudad = ciudadMapping[cityName];
      if (this.isNoneOrNaN(codigoCiudad)) {
        console.warn(`Ciudad no encontrada en el mapeo: ${cityName}. Se usará el valor predeterminado para Bogotá.`);
        codigoCiudad = ciudadMapping["Bogotá"];
      }
      return codigoCiudad;
    }
  }
  