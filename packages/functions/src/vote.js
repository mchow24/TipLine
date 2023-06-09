import { Table } from "sst/node/table";
import handler from "@TipLine/core/handler";
import dynamoDb from "@TipLine/core/dynamodb";

export const main = handler(async (event) => {
console.log("hjaGSSGHJDGASJHDGDJAG");
  const data = JSON.parse(event.body);
  const params = {
    TableName: Table.Posts.tableName,
    // 'Key' defines the partition key and sort key of the item to be updated
    Key: {
      userId: event.requestContext.authorizer.iam.cognitoIdentity.identityId,
      postId: event.pathParameters.id, // The id of the note from the path
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET voteCount = :voteCount",
    ExpressionAttributeValues: {
      ":voteCount": data.voteCount || null
    },
    // 'ReturnValues' specifies if and how to return the item's attributes,
    // where ALL_NEW returns all attributes of the item after the update; you
    // can inspect 'result' below to see how it works with different settings
    ReturnValues: "ALL_NEW",
  };

  

  await dynamoDb.update(params);

  return { status: true };
});