import { Client } from "ssh2";

export class SshConnection {
  constructor(private readonly client: Client) {
  }

  public async remoteForward(remoteAddress: string, remotePort: number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.client.forwardIn(remoteAddress, remotePort, (err) => {
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
