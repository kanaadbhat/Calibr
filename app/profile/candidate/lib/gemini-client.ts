import axios from "axios";
import { extractJsonFromResponse } from "@/ai-engine/ai-call/aiCall";
import { resumePrompt } from "@/ai-engine/prompts/prompt";

export class GeminiClient {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.NEXT_GEMINI_API!;
  }
  
  // Helper function to prepare Gemini API payload
  async preparePayload(file: File, resumeText: string, useDirectUpload: boolean): Promise<any> {
    if (useDirectUpload) {
      console.log("Sending file directly to Gemini...");
      const bytes = await file.arrayBuffer();
      const base64Data = Buffer.from(bytes).toString("base64");

      return {
        contents: [
          {
            parts: [
              {
                text: resumePrompt + "\n\nPlease extract and analyze the information from this resume file:",
              },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      };
    } else {
      console.log("Sending extracted text to Gemini...");

      if (!resumeText || resumeText.trim().length < 30) {
        throw new Error("Could not extract meaningful text from the file. Please try a different file format.");
      }

      // Clean up the text
      let cleanedText = resumeText
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .trim();

      // Truncate if too long
      const MAX_CHARS = 35000;
      if (cleanedText.length > MAX_CHARS) {
        cleanedText = cleanedText.slice(0, MAX_CHARS) + "\n\n[TRUNCATED]";
      }

      console.log("Text preview:", cleanedText.substring(0, 300) + "...");

      return {
        contents: [
          {
            parts: [
              {
                text: resumePrompt + "\n\n" + cleanedText,
              },
            ],
          },
        ],
      };
    }
  }

  // Helper function to call Gemini API
  async callAPI(payload: any): Promise<any> {
    console.log("Calling Gemini API...");
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );
    return response.data;
  }

  // Helper function to parse Gemini response
  parseResponse(data: any): any {
    try {
      const rawResponse = data.candidates[0].content.parts[0].text;
      console.log("Gemini response received, length:", rawResponse.length);

      const cleanedText = extractJsonFromResponse(rawResponse);
      const parsedData = JSON.parse(cleanedText);
      console.log(parsedData);
      console.log("Successfully parsed Gemini response");
      return parsedData;
    } catch (err) {
      console.error("Failed to parse Gemini JSON:", err);
      console.error("Raw response:", data.candidates[0].content.parts[0].text);
      throw new Error("Failed to parse AI response. The AI might not have returned valid JSON.");
    }
  }

  // Main method to parse resume using Gemini
  async parseResume(file: File, resumeText: string, useDirectUpload: boolean): Promise<any> {
    const payload = await this.preparePayload(file, resumeText, useDirectUpload);
    const geminiResponse = await this.callAPI(payload);
    return this.parseResponse(geminiResponse);
  }
}

export const geminiClient = new GeminiClient();