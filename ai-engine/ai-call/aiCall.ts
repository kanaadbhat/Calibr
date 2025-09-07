import axios from "axios";

const apiKey = process.env.NEXT_GEMINI_API;
const apiCall = async (request: string) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: "STRICTLY RETURN " + request,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
};

const cleanJsonString = (str: any) => {
  return str
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/\n\s*\n/g, "\n")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();
};

export const extractJsonFromResponse = (text: any) => {
  const cleanedText = cleanJsonString(text);
  const codeBlockMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    const extracted = cleanJsonString(codeBlockMatch[1]);
    return extracted;
  }
  const arrayMatch = cleanedText.match(/\[\s*{[\s\S]*?}\s*\]/);
  if (arrayMatch) {
    const extracted = cleanJsonString(arrayMatch[0]);
    return extracted;
  }

  const objectMatch = cleanedText.match(/{\s*"[\s\S]*?}\s*$/);
  if (objectMatch) {
    const extracted = cleanJsonString(objectMatch[0]);
    return extracted;
  }

  const jsonPattern = /(\[[\s\S]*\]|\{[\s\S]*\})/;
  const match = cleanedText.match(jsonPattern);
  if (match) {
    const extracted = cleanJsonString(match[1]);
    return extracted;
  }

  const lines = cleanedText
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("[") || line.startsWith("{")) {
      const potentialJson = lines.slice(i).join(" ");
      const cleaned = cleanJsonString(potentialJson);

      try {
        JSON.parse(cleaned);
        return cleaned;
      } catch (e) {
        console.log("Invalid JSON, continuing search...");
        continue;
      }
    }
  }
  console.log("No JSON pattern found, returning cleaned text");
  return cleanedText;
};

const validateAndParseJson = (jsonString: any) => {
  const trimmed = jsonString.trim();

  if (!trimmed) {
    throw new Error("Empty JSON string");
  }

  if (
    !(trimmed.startsWith("[") && trimmed.endsWith("]")) &&
    !(trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    throw new Error("JSON string doesn't have proper start/end characters");
  }

  return JSON.parse(trimmed);
};

export const getGeminiResponse = async (request: any, json: boolean) => {
  try {
    let rawResponse = await apiCall(
      json == true ? "JSON format" + request : request
    );
    if (!json) {
      return rawResponse;
    }
    const cleanJsonString = extractJsonFromResponse(rawResponse);
    if (!cleanJsonString) {
      throw new Error("Could not extract JSON from response");
    }
    try {
      const parsedData = validateAndParseJson(cleanJsonString);
      return parsedData;
    } catch (parseError: any) {
      console.error("JSON parsing failed:", parseError.message);
      console.log("Problematic JSON string:", cleanJsonString);

      const aggressivelyCleaned = cleanJsonString
        .replace(/[^\x20-\x7E\[\]{}":,\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      try {
        const finalAttempt = JSON.parse(aggressivelyCleaned);
        return finalAttempt;
      } catch (finalError: any) {
        console.error("Final parsing attempt failed:", finalError.message);
        throw new Error(
          `Could not parse JSON after multiple attempts. Original error: ${parseError.message}`
        );
      }
    }
  } catch (error: any) {
    console.error("getGeminiResponse Error:", error.message);
    console.error("Error stack:", error.stack);
    return null;
  }
};
