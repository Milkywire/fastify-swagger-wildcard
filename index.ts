import Fastify from "fastify";

import { Type, TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

async function start() {
  const fastify = Fastify({
    logger: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  await setupSwagger(fastify);

  // Declare a route
  fastify.get(
    "/id/:id/star/*",
    {
      schema: {
        params: Type.Object({
          id: Type.Number(),
          "*": Type.String(),
        }),
      },
    },
    (request, reply) => {
      reply.send(request.params);
    }
  );

  // Run the server!
  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) throw err;
    // Server is now listening on ${address}
    fastify.swagger();
  });
}

start()
  .then(() => console.log("Server started!"))
  .catch(console.error);

async function setupSwagger(fastify) {
  await fastify.register(import("@fastify/swagger"), {
    openapi: {
      info: {
        title: "Swagger with wildcard route",
        version: "0.1.0",
      },
      host: "localhost",
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      servers: [
        {
          url: "http://localhost",
        },
      ],
    },
    exposeRoute: true,
    routePrefix: "/docs",
  });

  await fastify.register(import("@fastify/swagger-ui"), {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
}
