import * as functions from "firebase-functions";

const { server, secret } = functions.config().graphql;

export { server, secret };
