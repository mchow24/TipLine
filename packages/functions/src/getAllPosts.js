import { Table } from "sst/node/table";
import handler from "@TipLine/core/handler";
import dynamoDb from "@TipLine/core/dynamodb";

export const main = handler(async (event) => {
  const params = {
    TableName: Table.Posts.tableName,
    Key: {
      userId: event.requestContext.authorizer.iam.cognitoIdentity.identityId,
      postId: '0f9bf320-0646-11ee-a95a-918feef3309c'
    }// 'Key' defines the partition key and sort key of the item to be retrieved
  };
  const result = await dynamoDb.getAll(params);
  if (!result.Items) {
    throw new Error("Item not found.");
  }

  // Return the retrieved item
  return result.Items;
});