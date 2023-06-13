import { Api, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack, app }) {
    const { table } = use(StorageStack);

    // Create the API
    const api = new Api(stack, "Api", {
        defaults: {
            authorizer: "iam",
            function: {
                bind: [table],
            },
        },
        routes: {
            "POST /tipline": "packages/functions/src/create.main",
            "GET /posts": "packages/functions/src/getAllPosts.main",
            "PUT /vote/{id}": "packages/functions/src/vote.main",
            "DELETE /posts/{id}": "packages/functions/src/delete.main",
            "POST /translate": "packages/functions/src/translate.main",
            "GET /getUsersPosts": "packages/functions/src/getUsersPosts.main",
            "PUT /post/{id}" : "packages/functions/src/postComment.main"
        },
    });

    // Show the API endpoint in the output
    stack.addOutputs({
        ApiEndpoint: api.url
      });

    // Return the API resource
    return {
        api,
    };
}