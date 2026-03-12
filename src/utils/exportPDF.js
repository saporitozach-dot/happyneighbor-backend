import jsPDF from 'jspdf';

export const exportMatchesToPDF = (matches, preferences) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.text('Your Street Matches', 105, yPos, { align: 'center' });
  yPos += 15;

  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });
  yPos += 10;

  // Preferences summary
  if (preferences) {
    doc.setFontSize(14);
    doc.text('Your Preferences:', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    Object.entries(preferences).forEach(([key, value]) => {
      if (value) {
        const label = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        doc.text(`${label}: ${value}`, 25, yPos);
        yPos += 6;
      }
    });
    yPos += 5;
  }

  // Matches
  matches.forEach((match, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text(`${index + 1}. ${match.street_name || match.name}`, 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.text(`Location: ${match.location}`, 20, yPos);
    yPos += 6;

    doc.text(`Match Score: ${match.matchScore}%`, 20, yPos);
    yPos += 6;

    if (match.survey_count) {
      doc.text(`Reviews: ${match.survey_count}`, 20, yPos);
      yPos += 6;
    }

    yPos += 5;
  });

  // Save
  doc.save('happy-neighbor-matches.pdf');
};





