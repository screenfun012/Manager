// Test script for Word export debugging
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const testWordExport = async () => {
  try {
    console.log('🧪 Testing Word export functionality...');

    // Simple test document
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Test Word Document",
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This is a test document to check if the Word export is working correctly.",
                size: 24,
              }),
            ],
          }),
        ],
      }],
    });

    console.log('📄 Document created successfully');

    // Generate and save
    const blob = await Packer.toBlob(doc);
    console.log('📦 Blob generated successfully, size:', blob.size);

    saveAs(blob, 'test-word-export.docx');
    console.log('💾 File saved successfully');

    console.log('✅ Word export test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Word export test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return false;
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testWordExport = testWordExport;
}

export default testWordExport;
