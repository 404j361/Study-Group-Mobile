import React from "react";
import Svg, { Path } from "react-native-svg";

type IconProps = {
    width?: number;
    height?: number;
    color?: string;
};

export default function TrendingIcon({ width, height, color }: IconProps) {
    return (
        <Svg
            width={width || 48}
            height={height || 48}
            viewBox="0 0 48 48"
            fill="none"
        >
            <Path
                d="M46 12L27 31L17 21L2 36"
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M34 12H46V24"
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
