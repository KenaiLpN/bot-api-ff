import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { fastifyCors } from "@fastify/cors";
import ScalarApiReference from "@scalar/fastify-api-reference";
import { userRoutes } from "./controllers/UserController";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);

app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: true,
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true,
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Bot API FF",
      description: "API para cadastro de clientes",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(ScalarApiReference, {
  routePrefix: "/api-docs",
});

app.register(userRoutes);

app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
  console.log("Http Server running on http://localhost:3333");
  console.log("Swagger running on http://localhost:3333/api-docs");
});
