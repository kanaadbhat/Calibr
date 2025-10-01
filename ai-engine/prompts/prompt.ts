export const resumePrompt = `
You are an highly trained Resume parser with a deep understanding of software engineering roles and modern recruitment algorithms.
Extract the following details from the resume and return your response in **only** the following **valid JSON format**:
{{
  "personal_info": {{
    "name": "string",
    "email": "string",
    "contact_number": "string",
    "address": "string",
    "linkedin": "string",
    "github": "string",
    "leetcode": "string",
    "portfolio": "string"
  }},
  "summary": "string",
  "education": [
    {{
      "degree": "string",
      "institution": "string",
      "year": "string",
    }}
  ],
  "skills": "string",
  "certificates": [
    {{
      "name": "string",
      "issuer": "string",
      "date": "string"
    }}
  ],
  "projects": [
    {{
      "name": "string",
      "description": "string",
      "technologies_used": ["string"],
      "github_link": "string",
      "link": "string",(this is the live link)
      "duration": "string"
    }}
  ],
  "workDetails": [
    {
      "company": "string",
      "position": "string",
      "duration": "string",
      "location": "string",
      "description": "string",
      "responsibilities": ["string"]
    }
  ],
  "technical_skills": {{
    "languages": ["string"],
    "frameworks_libraries": ["string"],
    "databases": ["string"],
    "tools_technologies": ["string"],
    "cloud_platforms": ["string"],
    "devops": ["string"]
  }},
  "achievements": [
    {{
      "title": "string",
      "description": "string",
      "date": "string"
    }}
  ],
  "extra_curricular_activities": [
    {{
      "activity": "string",
      "description": "string",
      "date": "string"
    }}
  ],
  "interests": ["string"],
  "socialLinks": {
      "linkedin": "string",
      "github": "string",
    },
}}


Important rules:
- ONLY output valid JSON — no markdown or triple backticks.
- DO NOT include any explanation before or after the JSON.
- YOU must return the skills field in the given schema.
- The workDetails field must contain an array of work experiences including internships and professional experience with detailed information for each role.
`;
