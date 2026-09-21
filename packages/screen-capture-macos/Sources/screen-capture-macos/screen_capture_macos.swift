import AppKit
import CoreImage
import CoreMedia
import CoreVideo
import Foundation
import ScreenCaptureKit

@main
struct ScreenCaptureMacOS {
    static func main() async {
        do {
            let content =
                try await SCShareableContent
                    .excludingDesktopWindows(
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

            configuration.minimumFrameInterval =
                CMTime(
                    value: 1,
                    timescale: 2
                )

            configuration.queueDepth = 3

            let output =
                ScreenFrameOutput()

            let stream =
                SCStream(
                    filter: filter,
                    configuration: configuration,
                    delegate: nil
                )

            try stream.addStreamOutput(
                output,
                type: .screen,
                sampleHandlerQueue:
                    DispatchQueue(
                        label:
                            "pokervision.screen.capture"
                    )
            )

            try await stream.startCapture()

            while !Task.isCancelled {
                try await Task.sleep(
                    for: .seconds(1)
                )
            }

            try await stream.stopCapture()
        } catch {
            fputs(
                "Screen capture failed: \(error)\n",
                stderr
            )

            exit(1)
        }
    }
}

final class ScreenFrameOutput:
    NSObject,
    SCStreamOutput {

    private let context =
        CIContext()

    private let lock =
        NSLock()

    private var lastFrameTime:
        CFAbsoluteTime = 0

    func stream(
        _ stream: SCStream,
        didOutputSampleBuffer sampleBuffer: CMSampleBuffer,
        of outputType: SCStreamOutputType
    ) {
        guard
            outputType == .screen,
            sampleBuffer.isValid,
            let imageBuffer =
                sampleBuffer.imageBuffer
        else {
            return
        }

        /*
         * ScreenCaptureKit may deliver frames
         * faster than requested.
         *
         * Keep PokerVision output at ~2 FPS.
         */
        let now =
            CFAbsoluteTimeGetCurrent()

        lock.lock()

        guard
            now - lastFrameTime >= 0.5
        else {
            lock.unlock()
            return
        }

        lastFrameTime = now

        lock.unlock()

        do {
            try writeFrame(
                imageBuffer
            )
        } catch {
            fputs(
                "Failed to encode frame: \(error)\n",
                stderr
            )
        }
    }

    private func writeFrame(
        _ pixelBuffer: CVPixelBuffer
    ) throws {
        let ciImage =
            CIImage(
                cvPixelBuffer:
                    pixelBuffer
            )

        guard let cgImage =
            context.createCGImage(
                ciImage,
                from: ciImage.extent
            )
        else {
            throw CaptureError
                .imageConversionFailed
        }

        let bitmap =
            NSBitmapImageRep(
                cgImage: cgImage
            )

        guard let jpegData =
            bitmap.representation(
                using: .jpeg,
                properties: [
                    .compressionFactor: 0.9
                ]
            )
        else {
            throw CaptureError
                .jpegEncodingFailed
        }

        try writePacket(
            jpegData
        )
    }

    private func writePacket(
        _ data: Data
    ) throws {
        guard
            data.count <=
                Int(UInt32.max)
        else {
            throw CaptureError
                .frameTooLarge
        }

        var length =
            UInt32(data.count)
                .bigEndian

        let header =
            Data(
                bytes: &length,
                count:
                    MemoryLayout<UInt32>
                        .size
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
    case imageConversionFailed
    case jpegEncodingFailed
    case frameTooLarge
}
