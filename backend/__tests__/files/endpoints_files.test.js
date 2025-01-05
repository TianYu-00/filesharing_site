const { app, request, db, seed, data, cleanupFolder } = require("../../testIndex");
const { testBaseUploadDir, createRelativePath, createFileNameWithSuffix } = require("../../src/pathHandler");
const path = require("path");
const fs = require("fs");
const testFileName = "test123.txt";
const testFilePath = path.join(__dirname, "..", "..", "db", "test_data", "test_files", testFileName);

afterAll(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  return db.end();
});

beforeEach(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// FILES
xdescribe("GET /api/files", () => {
  test("should return a 403 status code, indicating users cannot access the list of all users", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/files").set("Cookie", cookies).expect(403);
  });

  test("should return a 200 status code, indicating an admin successfully retrieves the list of all files", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/files").set("Cookie", cookies).expect(200);
  });
});

/////////////////////////////////////////////////////////////////////////// FILE INFO
xdescribe("GET /api/files/:file_id/info", () => {
  test("should return a 403 status code, indicating users cannot access file info", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/files/1/info").set("Cookie", cookies).expect(403);
  });

  test("should return a 200 status code, indicating an admin successfully retrieves file info", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body } = await request(app).get("/api/files/1/info").set("Cookie", cookies).expect(200);
    expect(body.data).toMatchObject({
      fieldname: expect.any(String),
      originalname: expect.any(String),
      encoding: expect.any(String),
      mimetype: expect.any(String),
      destination: expect.any(String),
      filename: expect.any(String),
      path: expect.any(String),
      size: expect.any(Number),
      user_id: expect.any(Number),
      created_at: expect.any(String),
      favourite: expect.any(Boolean),
      trash: expect.any(Boolean),
    });
  });

  test("should return a 404 status code, indicating the file does not exist", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/files/100/info").set("Cookie", cookies).expect(404);
  });

  test("should return a 400 status code, indicating the file ID is invalid", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/files/invalid-id/info").set("Cookie", cookies).expect(400);
  });
});

/////////////////////////////////////////////////////////////////////////// FILE UPLOAD
xdescribe("POST /api/files/upload", () => {
  test("should return 400 status code, indicating file is missing", async () => {
    const { body } = await request(app).post("/api/files/upload").expect(400);
    expect(body.success).toBe(false);
    expect(body.msg).toBe("File was not provided");
  });

  test("should return 200 status code, indicating file has been uploaded", async () => {
    const { body } = await request(app).post("/api/files/upload").attach("file", testFilePath).expect(200);
    expect(body.success).toBe(true);
    expect(body.msg).toBe("File has been uploaded");
  });

  test("should return 200 status code and contain file details with user id of null (guest upload)", async () => {
    const { body } = await request(app).post("/api/files/upload").attach("file", testFilePath).expect(200);
    expect(body.data).toHaveProperty("file");
    expect(body.data.file).toMatchObject({
      user_id: null,
    });
  });

  test("should return 200 status code and contain download link details", async () => {
    const { body } = await request(app).post("/api/files/upload").attach("file", testFilePath).expect(200);
    expect(body.data).toHaveProperty("downloadLink");
  });

  test("should return 200 status code and contain file details with user id of x (user upload)", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body } = await request(app)
      .post("/api/files/upload")
      .set("Cookie", cookies)
      .attach("file", testFilePath)
      .expect(200);
    expect(body.data).toHaveProperty("file");
    expect(body.data.file).toMatchObject({
      user_id: loginResponse.body.data.id,
    });
  });

  test("should be able to detect the file in uploads directory when successful (guest)", async () => {
    const { body } = await request(app).post("/api/files/upload").attach("file", testFilePath).expect(200);
    const fileDirectory = path.join(testBaseUploadDir, "guests", body.data.file.filename);
    expect(fs.existsSync(fileDirectory)).toBe(true);
  });

  test("should be able to detect the file in uploads directory when successful (user)", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body } = await request(app)
      .post("/api/files/upload")
      .set("Cookie", cookies)
      .attach("file", testFilePath)
      .expect(200);
    const fileDirectory = path.join(testBaseUploadDir, body.data.file.user_id.toString(), body.data.file.filename);
    expect(fs.existsSync(fileDirectory)).toBe(true);
  });
});

/////////////////////////////////////////////////////////////////////////// FILE DOWNLOAD
xdescribe("GET /api/files/:file_id/download", () => {
  test("should return 400 status code, indicating invalid file id", async () => {
    await request(app).get("/api/files/invalid-id/download").expect(400);
  });

  test("should return 404 status code, indicating file not found", async () => {
    await request(app).get("/api/files/100/download").expect(404);
  });

  test("should return 200 status code, indicating file downloaded successfully", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const fileId = uploadResponse.data.file.id;
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    await request(app).get(`/api/files/${fileId}/download?link=${downloadLink}`).expect(200);
  });

  test("should verify that the content of the downloaded file matches the content of the original file", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const fileId = uploadResponse.data.file.id;
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const downloadResponse = await request(app)
      .get(`/api/files/${fileId}/download?link=${downloadLink}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => callback(null, Buffer.concat(chunks)));
      })
      .expect(200);

    const originalFileContent = fs.readFileSync(testFilePath);
    expect(downloadResponse.body).toEqual(originalFileContent);
  });

  test("should return 403 status code, indicating forbidden access due to invalid download link", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const fileId = uploadResponse.data.file.id;

    await request(app).get(`/api/files/${fileId}/download?link=invalid-link`).expect(403);
  });

  test("should return a 200 status code, indicating the file was successfully downloaded by the owner without requiring a download link", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .set("Cookie", cookies)
      .attach("file", testFilePath)
      .expect(200);
    const fileId = uploadResponse.data.file.id;

    await request(app).get(`/api/files/${fileId}/download`).set("Cookie", cookies).expect(200);
  });

  // note:
  // test download link password later
});

/////////////////////////////////////////////////////////////////////////// FILE INFO BY LINK
xdescribe("GET /api/files/download-links/:download_link/file-info", () => {
  test("should return 404 status code, indicating file details not found", async () => {
    await request(app).get("/api/files/download-links/invalid-link/file-info").expect(404);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    await request(app).get(`/api/files/download-links/${downloadLink}/file-info`).expect(200);
  });

  test("should return 200 status code and contain file details", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body } = await request(app).get(`/api/files/download-links/${downloadLink}/file-info`).expect(200);
    // console.log(body.data);
    expect(body.data).toMatchObject({
      id: expect.any(Number),
      fieldname: expect.any(String),
      originalname: expect.any(String),
      encoding: expect.any(String),
      mimetype: expect.any(String),
      size: expect.any(Number),
      user_id: null,
      created_at: expect.any(String),
    });
  });

  test("should return 200 status code and contain file details with user id of x (user upload)", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .set("Cookie", cookies)
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body } = await request(app).get(`/api/files/download-links/${downloadLink}/file-info`).expect(200);
    expect(body.data).toMatchObject({
      user_id: loginResponse.body.data.id,
    });
  });

  test("should return 200 status code and contain file details with user id of null (guest upload)", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body } = await request(app).get(`/api/files/download-links/${downloadLink}/file-info`).expect(200);
    expect(body.data).toMatchObject({
      user_id: null,
    });
  });
});

/////////////////////////////////////////////////////////////////////////// DOWNLOAD LINK INFO BY LINK
xdescribe("GET /api/files/download-links/:download_link/details", () => {
  test("should return 404 status code, indicating download link details not found", async () => {
    await request(app).get("/api/files/download-links/invalid-link/details").expect(404);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    await request(app).get(`/api/files/download-links/${downloadLink}/details`).expect(200);
  });

  test("should return 200 status code and contain download link details", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body } = await request(app).get(`/api/files/download-links/${downloadLink}/details`).expect(200);
    expect(body.data).toMatchObject({
      id: expect.any(Number),
      file_id: expect.any(Number),
      download_url: expect.any(String),
      created_at: expect.any(String),
      expires_at: expect.any(String),
      password: expect.any(Boolean),
      download_count: expect.any(Number),
    });
  });
});

/////////////////////////////////////////////////////////////////////////// DOWNLOAD LINK COUNT INCREASE BY LINK ID
xdescribe("PATCH /api/files/download-links/:link_id/increase-download-count", () => {
  test("should return 400 status code, indicating invalid file id", async () => {
    await request(app).patch("/api/files/download-links/invalid-link-id/increase-download-count").expect(400);
  });

  test("should return 404 status code, indicating link not found", async () => {
    await request(app).patch("/api/files/download-links/000/increase-download-count").expect(404);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body } = await request(app).get(`/api/files/download-links/${downloadLink}/details`).expect(200);
    const linkId = body.data.id;

    await request(app).patch(`/api/files/download-links/${linkId}/increase-download-count`).expect(200);
  });

  test("should verify that the download count has increased by 1", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body: detailsResponse } = await request(app)
      .get(`/api/files/download-links/${downloadLink}/details`)
      .expect(200);
    const linkId = detailsResponse.data.id;
    const initialDownloadCount = detailsResponse.data.download_count;

    await request(app).patch(`/api/files/download-links/${linkId}/increase-download-count`).expect(200);

    const { body: updatedDetailsResponse } = await request(app)
      .get(`/api/files/download-links/${downloadLink}/details`)
      .expect(200);
    const updatedDownloadCount = updatedDetailsResponse.data.download_count;

    expect(updatedDownloadCount).toBe(initialDownloadCount + 1);
  });

  test("should return 403 status code, indicating download limit exceeded", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const bodyData = {
      download_limit: 1,
    };

    await request(app).post("/api/files/1/download-link").send(bodyData).set("Cookie", cookies).expect(200);
    // increase 1
    await request(app).patch(`/api/files/download-links/1/increase-download-count`).expect(200);
    // since we set the limit to 1 and we already increased the download count by 1, the next increase should fail
    await request(app).patch(`/api/files/download-links/1/increase-download-count`).expect(403);
  });
});

/////////////////////////////////////////////////////////////////////////// DOWNLOAD LINKS BY FILE ID
xdescribe("GET /api/files/:file_id/download-links", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).get("/api/files/1/download-links").expect(401);
  });

  test("should return 403 status code, indicating forbidden access (logged in but not the owner)", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const newUploadId = uploadResponse.data.file.id;

    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).get(`/api/files/${newUploadId}/download-links`).set("Cookie", cookies).expect(403);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).get("/api/files/1/download-links").set("Cookie", cookies).expect(200);
  });
});

/////////////////////////////////////////////////////////////////////////// DOWNLOAD LINK CREATION BY FILE ID
xdescribe("POST /api/files/:file_id/download-link", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).post("/api/files/1/download-link").expect(401);
  });

  test("should return 403 status code, indicating forbidden access (logged in but not the owner)", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const newUploadId = uploadResponse.data.file.id;

    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).post(`/api/files/${newUploadId}/download-link`).set("Cookie", cookies).expect(403);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).post("/api/files/1/download-link").set("Cookie", cookies).expect(200);
  });

  test("should return 200 status code and contain download link details", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body } = await request(app).post("/api/files/1/download-link").set("Cookie", cookies).expect(200);
    expect(body.data).toMatchObject({
      id: expect.any(Number),
      file_id: expect.any(Number),
      download_url: expect.any(String),
      created_at: expect.any(String),
      expires_at: null,
      download_count: expect.any(Number),
      download_limit: null,
    });
  });

  test("should return 200 status code and contain download link details with expires_at, download_limit", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const newDateNow = new Date().toISOString();
    const bodyData = {
      expires_at: newDateNow,
      download_limit: 5,
    };

    const { body } = await request(app)
      .post("/api/files/1/download-link")
      .set("Cookie", cookies)
      .send(bodyData)
      .expect(200);
    expect(body.data).toMatchObject({
      id: expect.any(Number),
      file_id: expect.any(Number),
      download_url: expect.any(String),
      created_at: expect.any(String),
      expires_at: newDateNow,
      download_count: 0,
      download_limit: 5,
    });
  });
});

/////////////////////////////////////////////////////////////////////////// VALIDATE DOWNLOAD LINK PASSWORD
xdescribe("POST /api/files/download-links/:link_id/validate-password", () => {
  test("should return 400 status code, indicating invalid link id", async () => {
    await request(app).post("/api/files/download-links/invalid-link-id/validate-password").expect(400);
  });

  test("should return 404 status code, indicating link not found", async () => {
    await request(app).post("/api/files/download-links/000/validate-password").expect(404);
  });

  test("should return 404 status code, indicating password is missing", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const bodyData = {
      password: "password",
    };

    await request(app).post("/api/files/1/download-link").set("Cookie", cookies).send(bodyData).expect(200);

    await request(app).post("/api/files/download-links/1/validate-password").expect(404);
  });

  test("should return 200 status code, indicating successful response and password is correct", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const bodyData = {
      password: "password",
    };

    await request(app).post("/api/files/1/download-link").set("Cookie", cookies).send(bodyData).expect(200);

    const { body } = await request(app)
      .post("/api/files/download-links/1/validate-password")
      .send(bodyData)
      .expect(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ isPasswordCorrect: true });
  });

  test("should return 401 status code, indicating unauthorized due to incorrect password", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const bodyData = {
      password: "password",
    };

    await request(app).post("/api/files/1/download-link").set("Cookie", cookies).send(bodyData).expect(200);

    const { body } = await request(app)
      .post("/api/files/download-links/1/validate-password")
      .send({ password: "incorrect-password" })
      .expect(401);
    expect(body.success).toBe(false);
  });
});

/////////////////////////////////////////////////////////////////////////// REMOVE DOWNLOAD LINK BY LINK ID
xdescribe("DELETE /api/files/download-links/:link_id", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).delete(`/api/files/download-links/1`).expect(401);
  });

  test("should return 403 status code, indicating forbidden access (logged in but not the owner)", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const newLinkId = uploadResponse.data.downloadLink.id;

    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).delete(`/api/files/download-links/${newLinkId}`).set("Cookie", cookies).expect(403);
  });

  test("should return 400 status code, indicating invalid link id", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).delete("/api/files/download-links/invalid-link-id").set("Cookie", cookies).expect(400);
  });

  test("should return 404 status code, indicating link not found", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).delete("/api/files/download-links/0").set("Cookie", cookies).expect(404);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body: createDownloadLinkResponse } = await request(app)
      .post("/api/files/1/download-link")
      .set("Cookie", cookies)
      .expect(200);
    const downloadLinkId = createDownloadLinkResponse.data.id;
    const { body } = await request(app)
      .delete(`/api/files/download-links/${downloadLinkId}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(body.success).toBe(true);
  });

  test("should verify download link has been removed successfully", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body: createDownloadLinkResponse } = await request(app)
      .post("/api/files/1/download-link")
      .set("Cookie", cookies)
      .expect(200);
    const downloadLinkId = createDownloadLinkResponse.data.id;
    const { body: removeDownloadLinkResponse } = await request(app)
      .delete(`/api/files/download-links/${downloadLinkId}`)
      .set("Cookie", cookies)
      .expect(200);

    const fileId = removeDownloadLinkResponse.data.file_id;
    const { body } = await request(app).get(`/api/files/${fileId}/download-links`).set("Cookie", cookies).expect(200);

    const linkIds = body.data.map((link) => link.id);
    expect(linkIds).not.toContain(downloadLinkId);
  });
});

/////////////////////////////////////////////////////////////////////////// FILE RENAME
xdescribe("PATCH /api/files/:file_id/rename", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).patch(`/api/files/1/rename`).send({ newFileName: "newName" }).expect(401);
  });

  test("should return 403 status code, indicating forbidden access (logged in but not the owner)", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).patch(`/api/files/1/rename`).send({ newFileName: "newName" }).set("Cookie", cookies).expect(403);
  });

  test("should return 400 status code, indicating invalid file id", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app)
      .patch("/api/files/invalid-file-id/rename")
      .send({ newFileName: "newName" })
      .set("Cookie", cookies)
      .expect(400);
  });

  test("should return 404 status code, indicating file not found", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).patch("/api/files/0/rename").send({ newFileName: "newName" }).set("Cookie", cookies).expect(404);
  });

  test("should return 200 status code, indicating successful response with correct data", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const newName = "newName";
    const { body } = await request(app)
      .patch("/api/files/1/rename")
      .send({ newFileName: newName })
      .set("Cookie", cookies)
      .expect(200);
    expect(body.success).toBe(true);
    expect(body.data.originalname).toBe(newName);
  });
});

/////////////////////////////////////////////////////////////////////////// FILE FAVOURITE
xdescribe("PATCH /api/files/:file_id/favourite", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).patch(`/api/files/1/favourite`).send({ favourite: false }).expect(401);
  });

  test("should return 403 status code, indicating forbidden access (logged in but not the owner)", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).patch(`/api/files/1/favourite`).send({ favourite: false }).set("Cookie", cookies).expect(403);
  });

  test("should return 400 status code, indicating invalid file id", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app)
      .patch("/api/files/invalid-file-id/favourite")
      .send({ favourite: false })
      .set("Cookie", cookies)
      .expect(400);
  });

  test("should return 404 status code, indicating file not found", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).patch("/api/files/0/favourite").send({ favourite: false }).set("Cookie", cookies).expect(404);
  });

  test("should return 200 status code, indicating successful response with correct data", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const newFavouriteState = true;
    const { body } = await request(app)
      .patch("/api/files/1/favourite")
      .send({ favourite: newFavouriteState })
      .set("Cookie", cookies)
      .expect(200);
    expect(body.success).toBe(true);
    expect(body.data.favourite).toBe(newFavouriteState);
  });
});

/////////////////////////////////////////////////////////////////////////// FILE TRASH
describe("PATCH /api/files/:file_id/trash", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).patch(`/api/files/1/trash`).send({ trash: false }).expect(401);
  });

  test("should return 403 status code, indicating forbidden access (logged in but not the owner)", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).patch(`/api/files/1/trash`).send({ trash: false }).set("Cookie", cookies).expect(403);
  });

  test("should return 400 status code, indicating invalid file id", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app)
      .patch("/api/files/invalid-file-id/trash")
      .send({ trash: false })
      .set("Cookie", cookies)
      .expect(400);
  });

  test("should return 404 status code, indicating file not found", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).patch("/api/files/0/trash").send({ trash: false }).set("Cookie", cookies).expect(404);
  });

  test("should return 200 status code, indicating successful response with correct data", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const newTrashState = true;
    const { body } = await request(app)
      .patch("/api/files/1/trash")
      .send({ trash: newTrashState })
      .set("Cookie", cookies)
      .expect(200);
    expect(body.success).toBe(true);
    expect(body.data.trash).toBe(newTrashState);
  });
});
