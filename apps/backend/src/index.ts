import express, { type Request, type Response } from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });
const s3Client = new S3Client({
  region: "ap-south-1",
  endpoint: "http://localhost:4566",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
  forcePathStyle: true,
});

app.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    console.log(req.file);
    try {
      const command = new PutObjectCommand({
        Bucket: "my-local-bucket",
        Key: req.file?.originalname,
        Body: req.file?.buffer,
      });
      const response = await s3Client.send(command);
      res.json({
        data: response,
        message: "File uploaded successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error uploading file");
    }
  }
);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
