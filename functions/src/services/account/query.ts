const upsertUserGql = `
  mutation upsert_user($email: String!, $name: String!) {
    upsert: insertUser(
      objects: { email: $email, name: $name }
      on_conflict: { constraint: user_email_key, update_columns: [updatedAt] }
    ) {
      affected_rows
      returning {
        id
        role {
          slug
        }
        userRoles {
          role {
            slug
          }
        }
      }
    }
  }
`;

export { upsertUserGql };
