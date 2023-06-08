import { Table } from "sst/node/table";
import * as uuid from "uuid";
import handler from "@tipline/core/handler";
import dynamoDb from "@tipline/core/dynamodb";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const params = {
    TableName: Table.Posts.tableName,
    Item: {
      // The attributes of the item to be created
      userId: "123", // The id of the author
      postId: uuid.v1(), // A unique uuid
      content: data.content, // Parsed from request body
      attachment: data.attachment, // Parsed from request body
      createdAt: Date.now(), // Current Unix timestamp
      voteCount: 0, // Initialize vote count to 0
      comments: "", // Initalize comment section
    },
  };

  await dynamoDb.put(params);

  return params.Item;
});