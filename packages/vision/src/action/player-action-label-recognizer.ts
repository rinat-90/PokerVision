import sharp from "sharp";

import {
  createWorker
} from "tesseract.js";

import type {
  Worker
} from "tesseract.js";

import type {
  CroppedFrame
} from "../table/crop-frame.js";

import {
  PlayerActionLabelDetector
} from "./player-action-label-detector.js";

import type {
  PlayerActionLabel
} from "./player-action-label-detector.js";

import {
  parsePlayerActionLabel
} from "./player-action-label-parser.js";

import {
  isFoldLabel
} from "./fold-label-matcher.js";

export interface PlayerActionLabelRecognition {
  label: PlayerActionLabel | null;

  rawText: string | null;

  confidence: number;

  matchingPixelRatio: number;
}

export class PlayerActionLabelRecognizer {
  private readonly detector =
    new PlayerActionLabelDetector();

  private worker: Worker | null =
    null;

  async recognize(
    frame: CroppedFrame
  ): Promise<PlayerActionLabelRecognition> {
    const detection =
      this.detector.detect(
        frame
      );

    /*
     * Green is sufficiently distinctive for
     * Place Bet in the observed UI.
     */
    if (
      detection.label ===
      "placeBet"
    ) {
      return {
        label: "placeBet",
        rawText: null,
        confidence: 1,
        matchingPixelRatio:
        detection.matchingPixelRatio
      };
    }

    /*
     * Fold must be a clean red candidate.
     *
     * Red alone is not sufficient because
     * some empty/action regions contain red
     * background noise.
     */
    const hasRedCandidate =
      detection.redPixelRatio >=
      0.02 &&
      detection.orangePixelRatio <=
      0.002 &&
      detection.greenPixelRatio <=
      0.002;

    const hasOrangeCandidate =
      detection.orangePixelRatio >
      detection.greenPixelRatio &&
      detection.orangePixelRatio >
      detection.redPixelRatio;

    if (
      !hasRedCandidate &&
      !hasOrangeCandidate
    ) {
      return {
        label: null,
        rawText: null,
        confidence: 0,
        matchingPixelRatio:
        detection.matchingPixelRatio
      };
    }

    /*
     * Fold benefits from a red-specific mask.
     *
     * Check / Call continue using the existing
     * grayscale preprocessing that already
     * works on the real fixture.
     */
    const image =
      hasRedCandidate
        ? await this.createRedMask(
          frame
        )
        : await this.createGrayscaleImage(
          frame
        );

    const worker =
      await this.getWorker();

    const result =
      await worker.recognize(
        image
      );

    const rawText =
      result.data.text
        .trim() || null;

    const confidence =
      rawText
        ? result.data.confidence /
        100
        : 0;

    if (
      hasRedCandidate
    ) {
      const isFold =
        rawText !== null &&
        isFoldLabel(
          rawText,
          confidence
        );

      return {
        label:
          isFold
            ? "fold"
            : null,

        rawText,

        confidence,

        matchingPixelRatio:
        detection.matchingPixelRatio
      };
    }

    const label =
      parsePlayerActionLabel(
        rawText ?? ""
      );

    /*
     * Orange candidates are only allowed to
     * produce Check or Call.
     */
    const validLabel =
      label === "check" ||
      label === "call"
        ? label
        : null;

    return {
      label:
      validLabel,

      rawText,

      confidence,

      matchingPixelRatio:
      detection.matchingPixelRatio
    };
  }

  async terminate(): Promise<void> {
    if (!this.worker) {
      return;
    }

    await this.worker.terminate();

    this.worker = null;
  }

  private async createGrayscaleImage(
    frame: CroppedFrame
  ): Promise<Buffer> {
    return sharp(
      frame.data,
      {
        raw: {
          width:
          frame.width,

          height:
          frame.height,

          channels:
            frame.channels as
              | 1
              | 2
              | 3
              | 4
        }
      }
    )
      .resize({
        width:
          frame.width * 4,

        height:
          frame.height * 4,

        kernel: "nearest"
      })
      .grayscale()
      .normalize()
      .threshold(120)
      .png()
      .toBuffer();
  }

  private async createRedMask(
    frame: CroppedFrame
  ): Promise<Buffer> {
    const mask =
      Buffer.alloc(
        frame.width *
        frame.height
      );

    let outputIndex = 0;

    for (
      let index = 0;
      index + 2 <
      frame.data.length;
      index +=
        frame.channels
    ) {
      const red =
        frame.data[
          index
          ] ?? 0;

      const green =
        frame.data[
        index + 1
          ] ?? 0;

      const blue =
        frame.data[
        index + 2
          ] ?? 0;

      const isRed =
        red >= 140 &&
        red >
        green * 1.5 &&
        red >
        blue * 1.5;

      /*
       * Dark text on a light background works
       * better for Tesseract in this ROI.
       */
      mask[outputIndex] =
        isRed
          ? 0
          : 255;

      outputIndex += 1;
    }

    return sharp(
      mask,
      {
        raw: {
          width:
          frame.width,

          height:
          frame.height,

          channels: 1
        }
      }
    )
      .resize({
        width:
          frame.width * 4,

        height:
          frame.height * 4,

        kernel: "nearest"
      })
      .png()
      .toBuffer();
  }

  private async getWorker(): Promise<Worker> {
    if (this.worker) {
      return this.worker;
    }

    this.worker =
      await createWorker(
        "eng"
      );

    await this.worker.setParameters({
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz "
    });

    return this.worker;
  }
}