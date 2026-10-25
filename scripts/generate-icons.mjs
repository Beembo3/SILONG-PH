import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const NAVY = [11, 20, 38, 255];
const ORANGE = [255, 122, 26, 255];
const WHITE = [247, 249, 252, 255];
const SKY = [125, 211, 252, 255];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function png(size, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    pixels.copy(raw, row + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    255,
  ];
}

function render(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const sunX = 0.5 * size;
  const sunY = 0.42 * size;
  const sunR = 0.19 * size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color = NAVY;
      const dx = x - sunX;
      const dy = y - sunY;
      const distance = Math.hypot(dx, dy);

      // Sun rays: eight tapered lines around the disc.
      if (distance > sunR * 1.22 && distance < sunR * 1.72) {
        const angle = Math.atan2(dy, dx);
        const step = Math.PI / 4;
        const nearest = Math.round(angle / step) * step;
        const delta = Math.abs(angle - nearest);
        if (delta < 0.075) {
          color = ORANGE;
        }
      }

      if (distance <= sunR) {
        const t = Math.max(0, Math.min(1, (sunY + sunR - y) / (sunR * 2)));
        color = mix([255, 159, 67, 255], ORANGE, t);
      }

      // Two water bands near the bottom.
      const wave1 = 0.72 * size + Math.sin((x / size) * Math.PI * 3.2) * size * 0.025;
      const wave2 = 0.8 * size + Math.sin((x / size) * Math.PI * 3.2 + 1.1) * size * 0.022;
      if (y > wave1 && y <= wave1 + size * 0.035) color = SKY;
      if (y > wave2 && y <= wave2 + size * 0.028) color = WHITE;

      const index = (y * size + x) * 4;
      pixels[index] = color[0];
      pixels[index + 1] = color[1];
      pixels[index + 2] = color[2];
      pixels[index + 3] = 255;
    }
  }

  // Rounded corners for standard icons (not maskable). A small radius keeps
  // the icon legible when the platform applies its own mask.
  const radius = size * 0.18;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = x < radius ? radius : x > size - radius ? size - radius : x;
      const cy = y < radius ? radius : y > size - radius ? size - radius : y;
      if (Math.hypot(x - cx, y - cy) > radius) {
        const index = (y * size + x) * 4;
        pixels[index + 3] = 0;
      }
    }
  }

  return png(size, pixels);
}

function ico(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const directory = Buffer.alloc(entries.length * 16);
  let offset = 6 + directory.length;
  entries.forEach((entry, index) => {
    const base = index * 16;
    directory[base] = entry.size >= 256 ? 0 : entry.size;
    directory[base + 1] = entry.size >= 256 ? 0 : entry.size;
    directory[base + 2] = 0;
    directory[base + 3] = 0;
    directory.writeUInt16LE(1, base + 4);
    directory.writeUInt16LE(32, base + 6);
    directory.writeUInt32LE(entry.data.length, base + 8);
    directory.writeUInt32LE(offset, base + 12);
    offset += entry.data.length;
  });
  return Buffer.concat([header, directory, ...entries.map((entry) => entry.data)]);
}

const publicDir = path.join(process.cwd(), "public");
const iconDir = path.join(publicDir, "icons");
fs.mkdirSync(iconDir, { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  fs.writeFileSync(path.join(iconDir, `icon-${size}.png`), render(size));
}
fs.writeFileSync(path.join(iconDir, "apple-touch-icon.png"), render(180));
fs.writeFileSync(
  path.join(publicDir, "favicon.ico"),
  ico([
    { size: 32, data: render(32) },
    { size: 48, data: render(48) },
  ]),
);

console.log("Generated PWA icons: 192, 512, 180, favicon.ico");
