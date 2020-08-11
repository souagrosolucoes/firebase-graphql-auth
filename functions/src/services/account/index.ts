import { GraphQLClient } from "graphql-request";

import { server, secret } from "../../config";
import { upsertUserGql } from "./query";

const client = new GraphQLClient(server, {
  headers: {
    "content-type": "application/json",
    "x-hasura-admin-secret": secret,
  },
});

interface User {
  id?: string;
  defaultRole?: string;
  roles?: string[];
}

const upsertUser = (variables: any): Promise<User> =>
  client.request(upsertUserGql, variables).then((data: any) => {
    const items = data.upsert.returning;
    let user = null;
    if (items.length > 0) {
      user = items[0];
    }
    if (!user) {
      new Error("User not found");
    }

    const { id, userRoles, role } = user;
    return {
      id,
      defaultRole: role.slug,
      roles: userRoles.map((item: any) => item.role.slug),
    };
  });

export { client, upsertUser };
