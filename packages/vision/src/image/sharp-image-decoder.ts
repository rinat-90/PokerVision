import sharp from "sharp";

import type {
  DecodedImage,
  ImageDecoder
} from "./image-decoder.js";

export class SharpImageDecoder
  implements ImageDecoder
{
  async decode(
    data: Uint8Array
  ): Promise<DecodedImage> {
    const result =
      await sharp(data)
        .raw()
        .toBuffer({
          resolveWithObject: true
        });

    return {
      width: result.info.width,
      height: result.info.height,
      channels: result.info.channels,
      data: new Uint8Array(result.data)
    };
  }
}