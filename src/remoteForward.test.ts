import { GenericContainer } from "testcontainers";
import { createServer, Server } from "http";
import { AddressInfo } from "net";
import { createSshConnection, SshConnection, ConnectConfig } from ".";

jest.setTimeout(180_000);

test("should forward remote port", async () => {
  const container = await new GenericContainer("testcontainers/sshd", "1.0.0")
    .withExposedPorts(22)
    .withEnv("PASSWORD", "root")
    .withCmd([
      "sh",
      "-c",
      `echo "root:root" | chpasswd && /usr/sbin/sshd -D -o PermitRootLogin=yes -o AddressFamily=inet -o GatewayPorts=yes`,
    ])
    .start();

  const server: Server = createServer((req, res) => {
    res.writeHead(200);
    res.end("hello world");
  });
  server.listen(0);
  const serverPort = (server.address() as AddressInfo).port;

  const connectConfig: ConnectConfig = {
    host: container.getHost(),
    port: container.getMappedPort(22),
    username: "root",
    password: "root"
  };

  const sshConnection: SshConnection = await createSshConnection(connectConfig);
  await sshConnection.remoteForward("localhost", serverPort)

  const { output } = await container.exec(["wget", "-O", "-", `http://localhost:${serverPort}`]);

  expect(output).toBe("hello world");

  await server.close();
  await container.stop();
});
