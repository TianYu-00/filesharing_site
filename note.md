## Ideas/Planning
express.js on the backend with multer (https://www.npmjs.com/package/multer) middleware to handle uploading files.
for databases maybe postgreSQL to handle the file metadata, and potentially user information (if i decide to implement that)?

for the frontend im looking towards vite.js with tailwind css to quickly build and style the app.
could use some icon packages. Had great experience with "React-Icons" so i might continue using that.

MVP (Minimum viable product):
- Allow uploads
- Allow downloads
- Allow download links to be shared

Additional Ideas:
- Registration/Login (JWT, bcrypt, need some look into)
- File auto delete after 24 hours if was uploaded by guest (not logged in)
- Allow logged in users to delete files they uploaded
- Allow logged in users to add password to their shared link
- Allow link expiration setup
- Allow limited download
- Allow folder structure



## Backend 
- express.js
- cors
- multer

## Frontend 
- react (vite.js)
- tailwind css
- react-icons
