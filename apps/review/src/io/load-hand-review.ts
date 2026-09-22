import type {
  HandReview
} from "@poker-vision/hand-review";

export async function loadHandReview(
  file: File
): Promise<HandReview> {
  const text =
    await file.text();

  const value: unknown =
    JSON.parse(text);

  if (
    typeof value !== "object" ||
    value === null ||
    !("id" in value) ||
    !("players" in value) ||
    !("streets" in value) ||
    !("decisions" in value)
  ) {
    throw new Error(
      "Invalid HandReview file"
    );
  }

  return value as HandReview;
}

export async function loadHandReviews(
  files: FileList | File[],
): Promise<HandReview[]> {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        loadHandReview(file),
    ),
  );
}