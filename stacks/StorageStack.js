import { Bucket, Table } from "sst/constructs";

export function StorageStack({ stack, app }) {
    // Create the DynamoDB table
    // Create an S3 bucket
    const bucket = new Bucket(stack, "Uploads", {
        cors: [
          {
            maxAge: "1 day",
            allowedOrigins: ["*"],
            allowedHeaders: ["*"],
            allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          },
        ],
    });

    const table = new Table(stack, "Posts", {
        fields: {
            userId: "string",
            postId: "string",
            votes: "string",
            comments: "string",
        },
        primaryIndex: { partitionKey: "userId", sortKey: "postId" },
    });

    return {
        table,
        bucket,
    };
}