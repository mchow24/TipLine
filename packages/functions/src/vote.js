import { Table } from "sst/node/table";
import handler from "@TipLine/core/handler";
import dynamoDb from "@TipLine/core/dynamodb";

export const main = handler(async (event) => {
    var data = 0
  try {
    data = JSON.parse(event.body);
  } catch{
    data = 0;
  }
  const getPostParams = {
    TableName: Table.Posts.tableName,

    Key: {
      postId: event.pathParameters.id, // The id of the note from the path
      userId: event.requestContext.authorizer.iam.cognitoIdentity.identityId,
    }
  }

  const result = await dynamoDb.getAll(getPostParams);
  if (!result.Items) {
    throw new Error("Item Not Found");
  }

  var postObj = result.Items.find(obj => {
    return obj.postId === event.pathParameters.id
  })

  const post = JSON.parse(postObj.votes);

  var newVotes = {...post};

  newVotes[event.requestContext.authorizer.iam.cognitoIdentity.identityId] = data

  const params = {
    TableName: Table.Posts.tableName,
    // 'Key' defines the partition key and sort key of the item to be updated
    Key: {
      postId: event.pathParameters.id, // The id of the note from the path
      userId: postObj.userId,
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET votes = :votes",
    ExpressionAttributeValues: {
      ":votes": JSON.stringify(newVotes) || ""
    },
    // 'ReturnValues' specifies if and how to return the item's attributes,
    // where ALL_NEW returns all attributes of the item after the update; you
    // can inspect 'result' below to see how it works with different settings
    ReturnValues: "ALL_NEW",
  };

  

  await dynamoDb.update(params);

  return { status: true };
});