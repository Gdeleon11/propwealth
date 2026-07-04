// Utilidades de subida de archivos (sin backend externo: se guardan como data URLs).

// Redimensiona una imagen del lado del cliente y devuelve un data URL JPEG comprimido.
export function fileToResizedDataUrl(file: File, maxSize = 1280, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Imagen inválida'))
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas no disponible'))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

// Convierte un archivo (documento) a data URL. Rechaza si supera maxBytes.
export function fileToDataUrl(file: File, maxBytes = 3_000_000): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(new Error(`El archivo supera ${Math.round(maxBytes / 1_000_000)}MB`))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}
