import AppKit
import CoreGraphics
import Foundation
import ScreenCaptureKit

@main
struct ScreenCaptureMacOS {
    static func main() async {
        do {
            let content =
                try await SCShareableContent.excludingDesktopWindows(
                    false,
                    onScreenWindowsOnly: true
                )

            guard let display =
                content.displays.first
            else {
                throw CaptureError.noDisplay
            }

            let filter =
                SCContentFilter(
                    display: display,
                    excludingWindows: []
                )

            let configuration =
                SCStreamConfiguration()

            configuration.width =
                display.width

            configuration.height =
                display.height

            configuration.showsCursor =
                true

            let fps = 2
            let frameInterval =
                1.0 / Double(fps)

            while true {
                let image =
                    try await SCScreenshotManager.captureImage(
                        contentFilter: filter,
                        configuration: configuration
                    )

                let bitmap =
                    NSBitmapImageRep(
                        cgImage: image
                    )

                guard let jpegData =
                    bitmap.representation(
                        using: .jpeg,
                        properties: [
                            .compressionFactor: 0.9
                        ]
                    )
                else {
                    throw CaptureError.jpegEncodingFailed
                }

                try writeFrame(
                    jpegData
                )

                try await Task.sleep(
                    for: .seconds(
                        frameInterval
                    )
                )
            }
        } catch {
            fputs(
                "Screen capture failed: \(error)\n",
                stderr
            )

            exit(1)
        }
    }

    private static func writeFrame(
        _ data: Data
    ) throws {
        guard data.count <= Int(UInt32.max)
        else {
            throw CaptureError.frameTooLarge
        }

        var length =
            UInt32(data.count).bigEndian

        let header =
            Data(
                bytes: &length,
                count:
                    MemoryLayout<UInt32>.size
            )

        let stdout =
            FileHandle.standardOutput

        try stdout.write(
            contentsOf: header
        )

        try stdout.write(
            contentsOf: data
        )
    }
}

enum CaptureError: Error {
    case noDisplay
    case jpegEncodingFailed
    case frameTooLarge
}