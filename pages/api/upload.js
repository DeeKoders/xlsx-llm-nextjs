import formidable from "formidable";
import fs from "fs";
import path from "path";
import { createDataContext, extractXlsxData } from "../../utils/xlsxHelpers";

export const config = {
  api: {
    bodyParser: false,
  },
};

let extractedData = null;
let dataContext = "";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const file = files.xlsxFile;
    const filePath = file.filepath;

    try {
      extractedData = extractXlsxData(filePath);
      // Save extractedData to ./extractedData.json
      fs.writeFileSync(
        path.join(process.cwd(), "extractedData.json"),
        JSON.stringify(extractedData, null, 2)
      );
      dataContext = createDataContext(extractedData);
      fs.unlinkSync(filePath);

      const firstEntry = Object.entries(extractedData)[0];

      res.status(200).json({
        message: "File processed successfully",
        extractedData,
        dataPreview: Object.keys(extractedData),
        sampleData: firstEntry,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
