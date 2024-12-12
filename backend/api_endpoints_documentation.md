# File Sharing Project (DropBoxer) API Endpoints Documentation

## API
- **GET** `/api`  
  - **Description**: Fetch API Endpoints Documentation.
  - **Permission**: All.

- **GET** `/api/test`  
  - **Description**: Test API call.
  - **Permission**: All.

---

## Users
- **GET** `/api/users`  
  - **Description**: Fetch a list of all users.
  - **Permission**: Admin only.

- **GET** `/api/users/:user_id`  
  - **Description**: Fetch a specific user by user id.
  - **Permission**: User & Admin.

- **PATCH** `/api/users/:user_id`  
  - **Description**: Edit a specific user by user id.
  - **Permission**: User & Admin.

- **GET** `/api/users/:user_id/files`  
  - **Description**: Fetch all files that belong to the specific user.
  - **Permission**: User & Admin.
---

## Files
- **GET** `/api/files`  
  - **Description**: Fetch a list of all files.
  - **Permission**: Admin only.

- **GET** `/api/files/info/:file_id`  
  - **Description**: Fetch a specific file by file id.
  - **Permission**: Admin only.

- **DELETE** `/api/files/delete-file-by-file-id/:file_id`  
  - **Description**: Delete a specific file by file id.
  - **Permission**: User & Admin.

- **PATCH** `/api/files/rename-file-by-file-id/:file_id`  
  - **Description**: Rename a specific file by file id.
  - **Permission**: User & Admin.

- **GET** `/api/files/download-link-by-file-id/:file_id`  
  - **Description**: Fetch a list of download links by file id.
  - **Permission**: User & Admin.

- **POST** `/api/files/create-download-link-by-file-id/:file_id`  
  - **Description**: Create a download links by file id.
  - **Permission**: User & Admin.

- **DELETE** `/api/files/remove-download-link-by-link-id/:link_id`  
  - **Description**: Delete a specific download link by link id.
  - **Permission**: User & Admin.

- **DELETE** `/api/files/remove-many-files-by-body-file-info`  
  - **Description**: Delete a list of files by file info (file_info object).
  - **Permission**: User & Admin.

- **PATCH** `/api/files/update-favourite-file-by-file-id/:file_id`  
  - **Description**: Update a specific file favourite state by file id.
  - **Permission**: User & Admin.

- **PATCH** `/api/files/update-trash-file-by-file-id/:file_id`  
  - **Description**: Update a specific file trash state by file id.
  - **Permission**: User & Admin.

- **GET** `/api/files/download-file-by-id/:file_id`  
  - **Description**: Download the file by file id.
  - **Permission**: All.

- **POST** `/api/files/file-upload`  
  - **Description**: Upload the file.
  - **Permission**: All.

- **GET** `/api/files/file-info-by-link/:download_link`  
  - **Description**: Get a specific file info by download link.
  - **Permission**: All.

- **GET** `/api/files/download-link-info-by-link/:download_link`  
  - **Description**: Get a specific download link info by download link.
  - **Permission**: All.

- **PATCH** `/api/files/increase-download-count-by-link-id/:link_id`  
  - **Description**: Increase download count by link id.
  - **Permission**: All.

- **POST** `/api/files/validate-download-password-by-link-id/:link_id`  
  - **Description**: Validate the password protected download link by link id.
  - **Permission**: All.
---

## Auth
- **GET** `/api/auth`  
  - **Description**: Fetch a list of all blacklisted tokens.
  - **Permission**: Admin only.

- **GET** `/api/auth/test`  
  - **Description**: Validate login state and user tokens (access & refresh).
  - **Permission**: User & Admin.

- **POST** `/api/auth/test-forgot-password-token`  
  - **Description**: Verify forgot password token.
  - **Permission**: All.

- **POST** `/api/auth/register`  
  - **Description**: Create the user.
  - **Permission**: All.

- **POST** `/api/auth/login`  
  - **Description**: Log in the user.
  - **Permission**: All.

- **POST** `/api/auth/logout`  
  - **Description**: Log out the user.
  - **Permission**: All.

- **POST** `/api/auth/forgot-password`  
  - **Description**: Request a password reset link.
  - **Permission**: All.
  
- **PATCH** `/reset-password`  
  - **Description**: Reset user password.
  - **Permission**: All.






  