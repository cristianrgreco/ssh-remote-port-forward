import { Client, ConnectConfig } from "ssh2";
import net from "net";
import { SshConnection } from "./SshConnection";

export const createSshConnection = async (connectConfig: ConnectConfig): Promise<SshConnection> => {
  const client: Client = await new Promise((resolve) => {
    const connection = new Client();
    connection
      .on("ready", () => resolve(connection))
      .on("tcp connection", (info, accept) => {
        const stream = accept();
        stream.pause();

        const socket = net.connect(info.destPort, info.destIP, () => {
          stream.pipe(socket);
          socket.pipe(stream);
          stream.resume();
        });
      })
      .connect(connectConfig);
  });

  return new SshConnection(client);
};
