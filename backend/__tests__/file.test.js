const { app, request, db, seed, data } = require("../testIndex");
const fs = require("fs");
const path = require("path");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("POST /api/files/upload", () => {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  const tempFilePath = path.join(__dirname, "test_text.txt");

  beforeAll(() => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    fs.writeFileSync(tempFilePath, "This is a test file for file uploading.");
  });

  afterAll(() => {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  });

  test("should upload a file successfully", async () => {
    const result = await request(app).post("/api/files/upload").attach("file", tempFilePath);
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.msg).toBe("File has been uploaded");
    expect(result.body.data).toHaveProperty("file.filename");
  });

  test("should return error when failed to upload file", async () => {
    const result = await request(app).post("/api/files/upload");
    expect(result.status).toBe(400);
    expect(result.body.success).toBe(false);
    expect(result.body.msg).toBe("No file uploaded");
  });
});
