// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "screen-capture-macos",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(
            name: "screen-capture-macos",
            targets: [
                "screen-capture-macos"
            ]
        )
    ],
    targets: [
        .executableTarget(
            name: "screen-capture-macos"
        )
    ]
)