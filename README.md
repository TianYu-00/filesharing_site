<div align="center">
<h1> DropBoxer</h1> 
Dropboxer is a file-sharing web app that allows users to securely upload, manage, and share files. It features an intuitive interface where users can drag and drop or select files to upload. The app offers robust file management capabilities, including options to view file details, rename files, download files, and manage download links with features like download limits, expiration dates/times, and password protection. Users can organize their files by favoriting, deleting, or restoring them, and filter files by categories such as All, Favorite, and Trash.
<br><br>
Dropboxer also includes secure login and registration through JWT, bcrypt, and HTTP-only cookies, along with password reset functionality and account settings to update user information and change passwords.
<br><br>

[![madewithlove](https://img.shields.io/badge/made_with-❤-red?style=for-the-badge&labelColor=orange
)](https://github.com/Tianyu-00)

[Getting started](https://github.com/TianYu-00/filesharing_site?tab=readme-ov-file#getting-started) | [Backend](https://github.com/TianYu-00/filesharing_site?tab=readme-ov-file#backend) | [Frontend](https://github.com/TianYu-00/filesharing_site?tab=readme-ov-file#frontend) | [Testing](https://github.com/TianYu-00/filesharing_site?tab=readme-ov-file#testing)

[![CI](https://github.com/TianYu-00/filesharing_site/actions/workflows/ci.yml/badge.svg)](https://github.com/TianYu-00/filesharing_site/actions/workflows/ci.yml)

![image](https://github.com/user-attachments/assets/cc915ffa-4439-43e0-bd5d-23daecac261f)

|              **Frontend**             |                 **Backend**                |
|:-------------------------------------:|:------------------------------------------:|
|          _https://vercel.com_         |            _https://railway.com_           |
| _https://dropboxer-tianyu.vercel.app_ | _https://dropboxer-tianyu.up.railway.app/_ |

</div>

## Getting started
### Prerequisites
- **Node.js** v21.7.2
- **PostgreSQL** v14.15
- **SendGrid API**
- **Libreoffice** v7.3.7.2

### Clone the repo
```
git clone https://github.com/TianYu-00/filesharing_site.git
```

## Backend
1) Navigate to backend directory and install the packages
```
cd backend
npm install
```

2) Create the ENV files

command:
```
echo -e "\nPGDATABASE=\"\" \nFRONTEND_URL=\"\" \nJWT_USER_PASSWORD_RESET_SECRET=\"\" \nJWT_USER_ACCESS_TOKEN_SECRET=\"\" \nJWT_USER_REFRESH_TOKEN_SECRET=\"\" \nSENDGRID_API_KEY=\"\" \nSECRET_SENDER_EMAIL=\"\" \nSECRET_SENDER_REPLY_TO=\"\"" >> .env.development
```

manually:
  1) Create a `.env.development` file in the backend directory.
  2) Add the following environment variables to the file:
  ```
  # Database settings
  PGDATABASE="" 
  
  # Frontend settings
  FRONTEND_URL="" 
  
  # JWT secrets for tokens
  JWT_USER_PASSWORD_RESET_SECRET="" 
  JWT_USER_ACCESS_TOKEN_SECRET="" 
  JWT_USER_REFRESH_TOKEN_SECRET="" 
  
  # SendGrid settings
  SENDGRID_API_KEY="" 
  SECRET_SENDER_EMAIL="" 
  SECRET_SENDER_REPLY_TO=""
  ```
  notes:
  - pg database is your database name
  - frontend url is usually `http://localhost:5173/`
  - could use `npm run fetch-secret-key` to generate your secret keys (refer to package.json)
  - sendgrid information can be accessed at `https://sendgrid.com`

3) Create the database
```
npm run setup-db
```

4) Seed the database
```
npm run seed
```

5) Start the server
```
npm start
```

## Frontend 
1) Navigate to frontend directory and install the packages
```
cd frontend
npm install
```

2) Start the server
```
npm run dev
```

## Testing
1) Navigate to backend if you have not already
      ```
        cd backend
      ```
2) Install the dependencies if you have not already
      ```
        npm install
      ```
3) Run the tests
      ```
        npm test
      ```

