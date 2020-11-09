import { Client } from "ssh2";

export class SshConnection {
  constructor(private readonly client: Client) {
  }

  public async remoteForward(port: number): Promise<void> {
    await new Promise((resolve, reject) => {
      this.client.forwardIn("127.0.0.1", port, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  public ref(): void {
    this.getSocket().ref();
  }

  public unref(): void {
    this.getSocket().unref();
  }

  private getSocket(): any {
    // @ts-ignore
    return this.client._sock;
  }
}
