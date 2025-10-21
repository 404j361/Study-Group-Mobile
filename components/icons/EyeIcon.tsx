import React from "react";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

type IconProps = {
    width?: number;
    height?: number;
    color?: string;
};

export default function EyeIcon({ width = 16, height = 16, color }: IconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 17 16" fill="none">
            <G clipPath="url(#clip0)">
                <Path
                    d="M1.16602 7.99984C1.16602 7.99984 3.83268 2.6665 8.49935 2.6665C13.166 2.6665 15.8327 7.99984 15.8327 7.99984C15.8327 7.99984 13.166 13.3332 8.49935 13.3332C3.83268 13.3332 1.16602 7.99984 1.16602 7.99984Z"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M8.5 10C9.60457 10 10.5 9.10457 10.5 8C10.5 6.89543 9.60457 6 8.5 6C7.39543 6 6.5 6.89543 6.5 8C6.5 9.10457 7.39543 10 8.5 10Z"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </G>
            <Defs>
                <ClipPath id="clip0">
                    <Rect
                        width="16"
                        height="16"
                        fill="white"
                        transform="translate(0.5)"
                    />
                </ClipPath>
            </Defs>
        </Svg>
    );
}
