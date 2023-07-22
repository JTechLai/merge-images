type ImageSource = { src: Image; x?: number; y?: number; opacity?: number };
type Image = string | Buffer;

interface Options {
  format: string;
  quality: number;
  width: number;
  height: number;
  background: string;
  Canvas?: any;
  Image?: any;
  worker?: boolean;
  outFormat: "blob" | "blob-url" | "base64";
  crossOrigin?: "anonymous" | "use-credentials" | "" | undefined;
}

const defaultOptions: Options = {
  format: "image/png",
  quality: 0.92,
  background: "#ffffff",
  width: 800,
  height: 800,
  worker: true,
  outFormat: "base64",
};

const createCanvas = (options: Partial<Options>, width: number, height: number): any => {
  return options.Canvas
    ? new options.Canvas()
    : options.worker
    ? document.createElement("canvas")
    : new OffscreenCanvas(width, height);
};

const loadImage = (source: any, options: Partial<Options>) => {
  return new Promise(async (resolve, reject) => {
    let img: any;
    if (options.worker) {
      if (source.constructor.name !== "Object") {
        source = { src: source };
      }
      img = new Image();
      img.onerror = () => reject(new Error("Couldn't load image"));
      img.onload = () => resolve(Object.assign({}, source, { img }));
      img.src = source.src;
    } else {
      if (typeof source === "string") {
        if (!source.startsWith("data:image/")) {
          throw new Error("Only base64 images are supported in nodejs");
        }
        source = convertBase64ToBlob(source);
      }
      img = await self.createImageBitmap(source);
      resolve({ ...source, img });
    }
  });
};

const mergeImages = async (sources: Blob[], options: Partial<Options> = {}): Promise<any> => {
  const opts = { ...defaultOptions, ...options };
  const { width, height } = opts;
  const canvas = createCanvas(opts, width, height);
  const ctx = canvas.getContext("2d");

  const images: any = await Promise.all(sources.map((source: any) => loadImage(source, opts))).catch((err) => {
    throw new Error(err);
  });

  const scale = Math.min((width ?? 0) / width || 1, (height ?? 0) / height || 1);
  canvas.width = width * scale;
  canvas.height = height * scale;

  if (opts.format === "image/jpeg") {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  images.forEach((image: any) => {
    ctx.globalAlpha = image.opacity || 1;
    ctx.drawImage(image.img, (image.x || 0) * scale, (image.y || 0) * scale, canvas.width, canvas.height);
  });

  if (opts.worker && opts.outFormat === "base64") {
    return canvas.toDataURL(opts.format, opts.quality);
  }

  return new Promise((resolve, reject) => {
    if (opts.worker) {
      canvas.toBlob(
        (blob: Blob) => {
          let result: any = blob;
          if (opts.outFormat === "blob-url") {
            result = URL.createObjectURL(blob);
          }
          resolve(result);
        },
        opts.format,
        opts.quality
      );
    } else {
      canvas.convertToBlob(options).then((blob: Blob) => {
        let result: any = blob;
        if (opts.outFormat === "base64") {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
            return;
          };
          reader.readAsDataURL(blob);
          return;
        }
        if (opts.outFormat === "blob-url") {
          result = URL.createObjectURL(blob);
        }
        resolve(result);
      });
    }
  });
};
function convertBase64ToBlob(base64: string) {
  const parts: any = base64.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const data = atob(parts[1]);

  const bytes = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    bytes[i] = data.charCodeAt(i);
  }

  // create blob
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  return blob;
}

export default mergeImages;
