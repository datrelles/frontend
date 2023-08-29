class FileGenerator {
    static generateAndDownloadTxtFile(content, filename) {
      // Crear un elemento de enlace temporal para descargar el archivo txt
      const element = document.createElement('a');
      
      // Crear un Blob con el contenido del archivo
      const fileBlob = new Blob([content], { type: 'text/plain' });
      
      // Establecer el atributo href del enlace al Blob
      element.href = URL.createObjectURL(fileBlob);
      
      // Establecer el nombre de archivo deseado
      element.download = filename;
      
      // Simular un clic en el enlace para iniciar la descarga
      element.click();
      
      // Liberar recursos
      URL.revokeObjectURL(element.href);
    }
  }
  
  export default FileGenerator;