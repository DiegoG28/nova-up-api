export const Errors = {
   UNSUPPORTED_FILE_TYPE_COVER: {
      error: 'UNSUPPORTED_FILE_TYPE_COVER',
      message: 'Unsupported file type. The post cover must be an image',
   },
   NO_ASSET_OR_FILE_PROVIDED: {
      error: 'NO_ASSET_OR_FILE_PROVIDED',
      message: 'At least one of asset or file must be provided',
   },
   UNSUPPORTED_FILE_TYPE: {
      error: 'UNSUPPORTED_FILE_TYPE',
      message: 'Unsupported file type',
   },
   NO_TOKEN_PROVIDED: {
      error: 'NO_TOKEN_PROVIDED',
      message:
         'Token not provided. Please verify that the token is being provided in the Authorization header using the Bearer scheme.',
   },
   INVALID_GOOGLE_TOKEN: {
      error: 'INVALID_GOOGLE_TOKEN',
      message: 'Invalid Google token.',
   },
   NO_EMAIL_IN_GOOGLE_TOKEN: {
      error: 'NO_EMAIL_IN_GOOGLE_TOKEN',
      message: 'Email not provided in Google token.',
   },
   NO_USER_LOGGED_IN: {
      error: 'NO_USER_LOGGED_IN',
      message: 'No user is logged in.',
   },
   ACCESS_DENIED_TO_RESOURCE: {
      error: 'ACCESS_DENIED_TO_RESOURCE',
      message: 'You do not have permissions to access this resource.',
   },
   CATEGORY_NOT_FOUND: {
      error: 'CATEGORY_NOT_FOUND',
      message: 'Category not found.',
   },
   ROLE_NOT_FOUND: {
      error: 'ROLE_NOT_FOUND',
      message: 'Role not found.',
   },
   DEPARTMENT_NOT_FOUND: {
      error: 'DEPARTMENT_NOT_FOUND',
      message: 'Department not found.',
   },
   POST_NOT_FOUND: {
      error: 'POST_NOT_FOUND',
      message: 'Post not found.',
   },
   CANNOT_PIN_NO_CONVO_POST: {
      error: 'CANNOT_PIN_NO_CONVO_POST',
      message: 'You cannot pin no convocatory post.',
   },
   FAILED_TO_CREATE_POST: {
      error: 'FAILED_TO_CREATE_POST',
      message: 'Failed to create post.',
   },
   USER_NOT_FOUND: {
      error: 'USER_NOT_FOUND',
      message: 'User not found.',
   },
   EMAIL_ALREADY_EXISTS: {
      error: 'EMAIL_ALREADY_EXISTS',
      message: 'Email already exists.',
   },
   CANNOT_DELETE_OWN_ACCOUNT: {
      error: 'CANNOT_DELETE_OWN_ACCOUNT',
      message: 'You cannot delete your own account.',
   },
   CANNOT_UPDATE_OWN_ACCOUNT: {
      error: 'CANNOT_UPDATE_OWN_ACCOUNT',
      message: 'You cannot update your own account.',
   },
   CATEGORYID_MUST_BE_STRING_NUMBER: {
      error: 'CATEGORYID_MUST_BE_STRING_NUMBER',
      message: 'categoryId must be a string number.',
   },
   CATEGORYID_MUST_BE_POSITIVE_NUMBER: {
      error: 'CATEGORYID_MUST_BE_POSITIVE_NUMBER',
      message: 'categoryId must be a positive number.',
   },
};
