## Ideas/Planning
express.js on the backend with multer middleware to handle uploading files.

jest for testing.

for databases maybe postgreSQL to handle the file metadata, and potentially user information (if i decide to implement that)?

for the frontend im looking towards vite.js with tailwind css to quickly build and style the app.
could use some icon packages. Had great experience with react-icons previously so i might continue using that.

SHOULD i use firebase to easily handle login/registration? or JWT, bcrypt with Sendgrid (email sending service). Feel like firebase should be fine for my project scale.

MVP (Minimum viable product):
- Allow uploads ✅
- Allow downloads ✅
- Allow download links to be shared ✅

Additional Ideas:
- Registration/Login (JWT, Bcrypt, Sendgrid)
    - Bcrypt ✅
    - JWT ✅
    - Sendgrid ✅
- User account edit ✅

- Allow logged in users to manually delete files they uploaded ✅
- Allow logged in users to add password to their shared link ✅
- Allow logged in users to add link expiration ✅
- Allow logged in users to add limited download ✅

- File auto delete after 24 hours if was uploaded by guest (not logged in) ✅

- Trash
- Favourite

- Styling 🟠
- User visual feedbacks 🟠


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
