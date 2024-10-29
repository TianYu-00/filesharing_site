## Ideas/Planning
express.js on the backend with multer middleware to handle uploading files.

jest for testing.

for databases maybe postgreSQL to handle the file metadata, and potentially user information (if i decide to implement that)?

for the frontend im looking towards vite.js with tailwind css to quickly build and style the app.
could use some icon packages. Had great experience with react-icons previously so i might continue using that.

MVP (Minimum viable product):
- Allow uploads
- Allow downloads
- Allow download links to be shared

Additional Ideas:
- Registration/Login (JWT, bcrypt, need some look into)
- File auto delete after 24 hours if was uploaded by guest (not logged in)
- Allow logged in users to manually delete files they uploaded
- Allow logged in users to add password to their shared link
- Allow link expiration setup
- Allow limited download
- Allow folder structure

## checking db
```
\psql
\c database_name
\dt
\d table_name
```

```
SELECT * FROM table_name;
```

## Backend 
- [express.js](https://expressjs.com/)
- [cors](https://www.npmjs.com/package/cors)
- [multer](https://www.npmjs.com/package/multer)
- [jest](https://jestjs.io/docs/getting-started)
- postgresql

## Frontend 
- [react (vite.js)](https://vite.dev/guide/)
- [tailwind css](https://tailwindcss.com/docs/installation)
- [react-icons](https://react-icons.github.io/react-icons/)

## Database
