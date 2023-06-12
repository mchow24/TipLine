import { Table } from "sst/node/table";
import handler from "@TipLine/core/handler";
import dynamoDb from "@TipLine/core/dynamodb";

export const main = handler(async (event) => {
  const params = {
    TableName: Table.Posts.tableName,
    // 'Key' defines the partition key and sort key of the item to be removed
    Key: {
      userId: event.requestContext.authorizer.iam.cognitoIdentity.identityId, // The id of the author
      postId: event.pathParameters.id, // The id of the note from the path
    },
  };

  await dynamoDb.delete(params);

  return { status: true };
});