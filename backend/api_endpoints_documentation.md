# File Sharing Project (DropBoxer) API Endpoints Documentation
---
## API
- **GET** `/api`  
  - **Description**: Fetch API Endpoints Documentation.
  - **Permission**: All.

- **GET** `/api/test`  
  - **Description**: Test API call.
  - **Permission**: All.

- **GET** `/api/health-check`  
  - **Description**: Checks the connectivity and health status of the database.
  - **Permission**: All.

---
## Auth
- **GET** `/api/auth/blacklist-tokens`  
  - **Description**: Fetch a list of all blacklisted tokens.
  - **Permission**: Admin only.

- **GET** `/api/auth/verify-user-token`  
  - **Description**: Validate login state and user tokens (access & refresh).
  - **Permission**: User & Admin.

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

- **POST** `/api/auth/forgot-password/verify`  
  - **Description**: Verify forgot password token.
  - **Permission**: All.
  
- **PATCH** `/api/auth/reset-password`  
  - **Description**: Reset user password.
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
  - **Permission**: User.

- **GET** `/api/users/:user_id/files`  
  - **Description**: Fetch all files that belong to the specific user.
  - **Permission**: User.
---

## Files
- **GET** `/api/files`  
  - **Description**: Fetch a list of all files.
  - **Permission**: Admin only.

- **GET** `/api/files/:file_id/info`  
  - **Description**: Fetch a specific file info by file id.
  - **Permission**: Admin only.

- **DELETE** `/api/files/:file_id`  
  - **Description**: Delete a specific file completely by file id.
  - **Permission**: User & Admin.

- **PATCH** `/api/files/:file_id/rename`  
  - **Description**: Rename a specific file by file id.
  - **Permission**: User.

- **GET** `/api/files/:file_id/download-links`  
  - **Description**: Fetch a list of download links by file id.
  - **Permission**: User.

- **POST** `/api/files/:file_id/download-link`  
  - **Description**: Create a download link by file id.
  - **Permission**: User.

- **DELETE** `/api/files/download-links/:link_id`  
  - **Description**: Delete a specific download link by link id.
  - **Permission**: User.

- **GET** `/api/files/:file_id/preview`  
  - **Description**: Preview a specific file by link id.
  - **Permission**: All.

- **PATCH** `/api/files/:file_id/favourite`  
  - **Description**: Update a specific file favourite state by file id.
  - **Permission**: User.

- **PATCH** `/api/files/:file_id/trash`  
  - **Description**: Update a specific file trash state by file id.
  - **Permission**: User.

- **GET** `/api/files/:file_id/download`  
  - **Description**: Download the file by file id.
  - **Permission**: All.

- **PATCH** `/api/files/trash-many/files`  
  - **Description**: Update many file trash state.
  - **Permission**: User.

- **DELETE** `/api/files/delete-many/files`  
  - **Description**: Delete many file completely.
  - **Permission**: User.

- **POST** `/api/files/upload`  
  - **Description**: Upload files.
  - **Permission**: All.

- **GET** `/api/files/download-links/:download_link/file-info`  
  - **Description**: Get a specific file info by download link.
  - **Permission**: All.

- **GET** `/api/files/download-links/:download_link/details`  
  - **Description**: Get a specific download link info by download link.
  - **Permission**: All.

- **PATCH** `/api/files/download-links/:link_id/increase-download-count`  
  - **Description**: Increase download count by link id.
  - **Permission**: All.

- **POST** `/api/files/download-links/:link_id/validate-password`  
  - **Description**: Validate the password protected download link by link id.
  - **Permission**: All.










  