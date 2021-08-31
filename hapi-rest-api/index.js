"use strict";

const Hapi = require("@hapi/hapi");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  server.route({
    method: "GET",
    path: "/",
    handler: (request, response) => {
      return "Hello rest API";
    },
  });

  server.route({
    method: "GET",
    path: "/developer/{username}",
    handler: (request, response) => {
      var developerMock = {};
      if (request.params.username == "rasel") {
        developerMock = {
          username: "rasel",
          password: "amarami",
          email: "mainurrrasel@gmail.com",
        };
      }
      return developerMock;
    },
  });

  server.route({
    method: "POST",
    path: "/developer",
    handler: (request, response) => {
      return (request.payload);
    }
  });


  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
