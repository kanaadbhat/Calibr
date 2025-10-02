import { getGeminiResponse } from "@/ai-engine/ai-call/aiCall";
import { resumePrompt } from "@/ai-engine/prompts/prompt";

export class GeminiClient {
  constructor() {}

  // Prepare payload - now returns both text and file data
  async preparePayload(file: File, resumeText: string, useDirectUpload: boolean): Promise<{
    text: string;
    fileData?: { base64: string; mimeType: string };
  }> {
    if (useDirectUpload) {
      console.log("Sending file directly to Gemini...");
      const bytes = await file.arrayBuffer();
      const base64Data = Buffer.from(bytes).toString("base64");

      return {
        text: resumePrompt,  // Just the prompt, no base64 in text
        fileData: {
          base64: base64Data,
          mimeType: file.type,
        },
      };
    } else {
      console.log("Sending extracted text to Gemini...");

      if (!resumeText || resumeText.trim().length < 30) {
        throw new Error("Could not extract meaningful text from the file. Please try a different file format.");
      }

      // Clean text
      let cleanedText = resumeText.replace(/\s+/g, " ").replace(/\n\s*\n/g, "\n").trim();

      // Truncate
      const MAX_CHARS = 35000;
      if (cleanedText.length > MAX_CHARS) {
        cleanedText = cleanedText.slice(0, MAX_CHARS) + "\n\n[TRUNCATED]";
      }

      console.log("Text preview:", cleanedText.substring(0, 300) + "...");

      return {
        text: resumePrompt + "\n\n" + cleanedText,
      };
    }
  }

  // Call Gemini directly
  async callAPI(requestText: string, fileData?: { base64: string; mimeType: string }): Promise<any> {
    console.log("Calling Gemini API...");
    return await getGeminiResponse(requestText, true, fileData);
  }

  // Parse response (just normalize string/JSON)
  parseResponse(response: any): any {
    try {
      if (typeof response === "string") {
        return JSON.parse(response);
      }
      return response; // already JSON
    } catch (err) {
      console.error("Failed to parse Gemini response:", err);
      console.error("Raw response:", response);
      throw new Error("Failed to parse AI response. The AI might not have returned valid JSON.");
    }
  }

  // Main entry
  async parseResume(file: File, resumeText: string, useDirectUpload: boolean): Promise<any> {
    const payload = await this.preparePayload(file, resumeText, useDirectUpload);
    const geminiResponse = await this.callAPI(payload.text, payload.fileData);
    return this.parseResponse(geminiResponse);
  }
}

export const geminiClient = new GeminiClient();
