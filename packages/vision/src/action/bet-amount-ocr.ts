import {
  createWorker
} from "tesseract.js";

import {
  parseBetAmount,
  type BetAmountParseResult
} from "./bet-amount-parser.js";

export interface BetAmountOcrResult {
  seatIndex: number;
  rawText: string | null;
  parsed: BetAmountParseResult;
  confidence: number;
}

export interface BetAmountOcr {
  recognize(
    image: Buffer,
    seatIndex: number
  ): Promise<BetAmountOcrResult>;
}

export interface TesseractBetAmountOcrOptions {
  language?: string;
}

export class NullBetAmountOcr
  implements BetAmountOcr
{
  async recognize(
    _image: Buffer,
    seatIndex: number
  ): Promise<BetAmountOcrResult> {
    return {
      seatIndex,
      rawText: null,
      parsed: {
        value: null,
        rawText: "",
        confidence: 0
      },
      confidence: 0
    };
  }
}

export class TesseractBetAmountOcr
  implements BetAmountOcr
{
  private readonly language: string;

  private worker:
    Awaited<
      ReturnType<typeof createWorker>
    > | null = null;

  constructor(
    options:
    TesseractBetAmountOcrOptions = {}
  ) {
    this.language =
      options.language ?? "eng";
  }

  private async getWorker() {
    if (this.worker) {
      return this.worker;
    }

    this.worker =
      await createWorker(
        this.language
      );

    await this.worker.setParameters({
      tessedit_char_whitelist:
        "0123456789.$,"
    });

    return this.worker;
  }

  async recognize(
    image: Buffer,
    seatIndex: number
  ): Promise<BetAmountOcrResult> {
    const worker =
      await this.getWorker();

    const result =
      await worker.recognize(
        image
      );

    const rawText =
      result.data.text.trim() ||
      null;

    const parsed =
      parseBetAmount(
        rawText ?? ""
      );

    return {
      seatIndex,
      rawText,
      parsed,
      confidence:
        rawText
          ? result.data.confidence / 100
          : 0
    };
  }

  async terminate(): Promise<void> {
    if (!this.worker) {
      return;
    }

    await this.worker.terminate();

    this.worker = null;
  }
}