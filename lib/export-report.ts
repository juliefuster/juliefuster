export async function exportReportToPDF(hotel: string, inspections: any[]) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib")
  const pdfDoc = await PDFDocument.create()
  let page = pdfDoc.addPage()
  const { height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let y = height - 50

  page.drawText(`Informe de Inspección — ${hotel}`, {
    x: 50,
    y,
    size: 18,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.3),
  })
  y -= 30

  inspections.forEach((item, i) => {
    if (y < 80) {
      // Añadir nueva página si no hay espacio
      page = pdfDoc.addPage()
      y = height - 50
      page.drawText(`Informe de Inspección — ${hotel}`, {
        x: 50,
        y,
        size: 16,
        font: fontBold,
      })
      y -= 30
    }

    page.drawText(`${i + 1}. Habitación/Zona: ${item.room_number}`, {
      x: 50,
      y,
      size: 12,
      font: fontBold,
    })
    y -= 18
    page.drawText(`Sección: ${item.section} | Elemento: ${item.element}`, {
      x: 70,
      y,
      size: 11,
      font,
    })
    y -= 15
    page.drawText(`Estado: ${item.status}`, { x: 70, y, size: 11, font })
    y -= 15
    if (item.notes) {
      page.drawText(`Notas: ${item.notes}`, {
        x: 70,
        y,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      })
      y -= 20
    }
    y -= 10
  })

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: "application/pdf" })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `Informe_${hotel}_${new Date().toISOString().split("T")[0]}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
