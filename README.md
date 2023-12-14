# fastify-swagger-wildcard

Shows a problem with the wildcard path and validation of swagger schema

# Description

When creating a route with the wildcard path, the swagger schema produced does not pass the validation at https://editor.swagger.io/. The problem is that url does not match with the path parameters in the schema because the `*` has been renamed to `wildcard`.

## Example:

When creating a route like this

```javascript
fastify.get(
  "/id/:id/star/*",
  {
    schema: {
      params: {
        id: { type: "number" },
        "*": { type: "string" },
      },
    },
  },
  (request, reply) => {
    reply.send(request.params);
  }
);
```

The documentation produced by fastify-swagger will replace the `*` with `{wildcard}` in the path of the endpoint. So the documentation will look like this

```json
"/id/{id}/star/{wildcard}": {
  "get": {
    "parameters": [
      {
        "schema": { "type": "number" },
        "in": "path",
        "name": "id",
        "required": true
      },
      {
        "schema": { "type": "string" },
        "in": "path",
        "name": "*",
        "required": true
      }
    ],
    "responses": { "200": { "description": "Default Response" } }
  }
}
```

Which means the parameters in the url will not match the values in the `parameters` array.

# Steps to reproduce

1. Start the server with `npm start` or `npm run start:ts` for TypeScript version
2. Go to http://localhost:3000/docs/json to get the OpenAPI schema
3. Copy the schema and paste it into the editor at https://editor.swagger.io/
4. The schema produces the following errors:

```
Semantic error at paths./id/{id}/star/{wildcard}
Declared path parameter "wildcard" needs to be defined as a path parameter at either the path or operation level
Jump to line 20

Semantic error at paths./id/{id}/star/{wildcard}.get.parameters.1.name
Path parameter "*" must have the corresponding {*} segment in the "/id/{id}/star/{wildcard}" path
Jump to line 31
```

# Workaround

A potential workaround that we looked at was to replace the star in the endpoint schema with “wildcard” to align with the documentation. This works okey when using JavaScript we just have to know that you still need to use the “\*” when getting the value from request.params.

However in our setup TypeScript and TypeBox for our schema setup this is not an option since the request.params object is limited to the fields you define in the schema.

This can be seen in the following example:

```typescript
fastify.get(
  "/id/:id/star/*",
  {
    schema: {
      params: Type.Object({
        id: Type.Number(),
        wildcard: Type.String(),
      }),
    },
  },
  (request, reply) => {
    console.log(request.params.wildcard); // undefined
    reply.send(request.params);
  }
);
```

You can test this in `index.ts`
