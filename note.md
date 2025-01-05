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

- Trash ✅
- Favourite ✅

- Styling ✅
- User visual feedbacks ✅

- Access Tokens + Refresh Tokens ✅
- Work on isRememberMe ✅

- Improve file access security: specifically file download api call ✅


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

## Access Tokens + Refresh Tokens
Thought process:
- User login/registration
- Create a Refresh token (30 days)
- Use the Refresh token to generate a Access token (15 min)
- Store both Refresh + Access token in http only cookie
- Access token cookie contains Access token(userData + jti + token type) 
- Refresh token cookie contains Refresh token(jti + userId + token type)
- When user logs out Access token needs to be black listed until expired
- When user logs out Refresh token needs to be black listed until expired
- Or use token white listing but i think black listing saves a lot more resources.
- How the table would look like:
```
{
    blacklisted_tokens: [
        {id: 1, jti: "xxx", expires_at: timezone, user_id: 1, blacklisted_at: timezone, token_type: "xxx" }, 
    ]
}
```
- Prob should add cronjob to remove any expired blacklisted tokens from database to prevent clutter
- When Access token expires, it would get the Refresh token from cookie and then call a function to generate a new Access token.

## Improve file access security
Thought process:
- Instead of using file_id directly to download the file, I should prob make it more complicated using uuid or crypto random bytes

Note from phone:
- GET /api/files/download/:file_id
- userTokenChecker
<!-- - isLoggedIn(Not needed in this case but SIDE NOTE, SHOULD PROB CREATE THIS INSTEAD OF REJECTING USER ACCESS STRAIGHT FROM AUTHTOKENCHECKER WHEN REFRESH TOKEN IS MISSING) -->
- controller

controller:
- check to see if the user exists
- if exists check to see if the file belongs to the user
- if the file belongs to the user: download file
- else
- check to see if req.query has a {link, password}
- if it does check the download link database to compare the link and password
- if both are correct: download file
- else
- reject access