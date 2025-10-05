// Helper function to extract text from different file types
export async function extractTextFromFile(file: File): Promise<{ text: string; useDirectUpload: boolean }> {
  let resumeText = "";
  let useDirectGeminiUpload = false;

  console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size);

  if (file.type === "application/pdf") {
    console.log("PDF detected - will send directly to Gemini");
    useDirectGeminiUpload = true;
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "application/msword" ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    try {
      const mammoth = require("mammoth");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;
      console.log("Word document parsed successfully, text length:", resumeText.length);
    } catch (wordError) {
      console.error("Word document parsing failed, will try Gemini direct upload:", wordError);
      useDirectGeminiUpload = true;
    }
  } else if (
    file.type === "text/plain" ||
    file.type === "text/rtf" ||
    file.name.toLowerCase().endsWith(".txt") ||
    file.name.toLowerCase().endsWith(".rtf")
  ) {
    try {
      resumeText = await file.text();
      console.log("Text file parsed successfully, text length:", resumeText.length);
    } catch (textError) {
      console.error("Text file parsing failed:", textError);
      throw new Error(
        textError instanceof Error ? textError.message : "Unknown text parsing error"
      );
    }
  } else {
    console.log("Unknown file type, will try Gemini direct upload");
    useDirectGeminiUpload = true;
  }

  return { text: resumeText, useDirectUpload: useDirectGeminiUpload };
}

// Helper function to determine MIME type from filename
export function getMimeTypeFromFileName(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop();
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    case 'rtf':
      return 'text/rtf';
    default:
      return 'application/octet-stream';
  }
}
