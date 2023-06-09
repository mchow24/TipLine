import { Api, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack, app }) {
    const { table } = use(StorageStack);

    // Create the API
    const api = new Api(stack, "Api", {
        customDomain:
            app.stage === "prod" ? "api.d17us03hyskcy.cloudfront.net" : undefined,
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
        },
    });

    // Show the API endpoint in the output
    stack.addOutputs({
        ApiEndpoint: api.customDomainUrl || api.url,
      });

    // Return the API resource
    return {
        api,
    };
}