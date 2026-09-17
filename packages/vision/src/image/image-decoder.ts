export interface DecodedImage {
  width: number;
  height: number;
  channels: number;
  data: Uint8Array;
}

export interface ImageDecoder {
  decode(
    data: Uint8Array
  ): Promise<DecodedImage>;
}