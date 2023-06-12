import { Table } from "sst/node/table";
import * as uuid from "uuid";
import handler from "@TipLine/core/handler";
import dynamoDb from "@TipLine/core/dynamodb";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const params = {
    TableName: Table.Posts.tableName,
    Item: {
      // The attributes of the item to be created
      userId: event.requestContext.authorizer.iam.cognitoIdentity.identityId, // The id of the author
      postId: uuid.v1(), // A unique uuid
      content: data.content, // Parsed from request body
      attachment: data.attachment, // Parsed from request body
      createdAt: Date.now(), // Current Unix timestamp
      votes: `{"${event.requestContext.authorizer.iam.cognitoIdentity.identityId}": 0}`, // Initialize vote count to 0
      comments: "{}", // Initalize comment section
    },
  };

  await dynamoDb.put(params);

  return params.Item;
});