import { Bucket, Table } from "sst/constructs";

export function StorageStack({ stack, app }) {
    // Create the DynamoDB table
    // Create an S3 bucket
    const bucket = new Bucket(stack, "Uploads");

    const table = new Table(stack, "Posts", {
        fields: {
            userId: "string",
            postId: "string",
            voteCount: "number",
            comments: "string",
        },
        primaryIndex: { partitionKey: "userId", sortKey: "postId" },
    });

    return {
        table,
        bucket,
    };
}