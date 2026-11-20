import { crc32 } from "zlib";
import { Writable } from "stream";

// Minimal streaming ZIP writer without compression. Avatars are PNGs which
// are already compressed, so deflating them again would only cost CPU.
// Only supports archives below 4 GiB (no ZIP64), plenty for one user's avatars.
export class ZipWriter {
  private offset = 0;
  private readonly central: Buffer[] = [];
  private count = 0;

  constructor(private readonly out: Writable) {}

  async add(name: string, data: Buffer, date = new Date()) {
    const fileName = Buffer.from(name, "utf8");
    const crc = crc32(data);
    const { time, day } = dosDateTime(date);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // utf-8 file names
    local.writeUInt16LE(0, 8); // stored
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(fileName.length, 26);
    local.writeUInt16LE(0, 28);

    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4); // version made by
    header.writeUInt16LE(20, 6); // version needed
    header.writeUInt16LE(0x0800, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(time, 12);
    header.writeUInt16LE(day, 14);
    header.writeUInt32LE(crc, 16);
    header.writeUInt32LE(data.length, 20);
    header.writeUInt32LE(data.length, 24);
    header.writeUInt16LE(fileName.length, 28);
    // extra, comment, disk, internal and external attributes stay 0
    header.writeUInt32LE(this.offset, 42);
    this.central.push(header, fileName);

    await this.write(local);
    await this.write(fileName);
    await this.write(data);
    this.count++;
  }

  async finish() {
    const centralOffset = this.offset;
    for (const chunk of this.central) await this.write(chunk);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(this.count, 8);
    end.writeUInt16LE(this.count, 10);
    end.writeUInt32LE(this.offset - centralOffset, 12);
    end.writeUInt32LE(centralOffset, 16);
    await this.write(end);
  }

  private async write(chunk: Buffer) {
    this.offset += chunk.length;
    if (!this.out.write(chunk)) {
      await new Promise<void>((resolve, reject) => {
        const onDrain = () => {
          this.out.off("close", onClose);
          resolve();
        };
        const onClose = () => {
          this.out.off("drain", onDrain);
          reject(new Error("Stream closed"));
        };
        this.out.once("drain", onDrain);
        this.out.once("close", onClose);
      });
    }
  }
}

const dosDateTime = (date: Date) => ({
  time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
  day: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
});
