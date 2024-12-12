const { marked } = require("marked");
const fs = require("fs").promises;
const path = require("path");

exports.getApis = async (req, res, next) => {
  try {
    const pathToMarkdownFile = path.join(__dirname, "..", "..", "api_endpoints_documentation.md");

    const markdownContent = await fs.readFile(pathToMarkdownFile, "utf8");

    const htmlMarkdownContent = marked(markdownContent);

    const finalHTML = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>API Endpoints</title>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Roboto', sans-serif;
              background-color: #151718;
              color: #CCC;
              padding: 20px
            }

            h1 {
              font-size: 2.5em;
              color: #6495ed;
            }

            p, li {
              font-size: 1.1em;
              line-height: 1.6;
            }

            code {
              background-color: #303030;
              padding: 5px;
              border-radius: 3px;
            }
          </style>
        </head>
        <body>
          ${htmlMarkdownContent}
        </body>
      </html>
    `;

    res.status(200).send(finalHTML);
  } catch (err) {
    next(err);
  }
};
