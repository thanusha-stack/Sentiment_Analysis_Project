export function UploadFile(file) {
  console.log("Uploading file:", file)
  return { success: true }
}

export function ExtractDataFromUploadedFile(file) {
  console.log("Extracting data from:", file)
  return { extracted: "Sample extracted text" }
}

export function InvokeLLM(prompt) {
  console.log("Invoking LLM with:", prompt)
  return { response: "Mock AI response" }
}
