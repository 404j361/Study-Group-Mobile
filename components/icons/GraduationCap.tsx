import React from "react";
import Svg, { Path } from "react-native-svg";

type IconProps = {
    width?: number;
    height?: number;
    color?: string;
};

export default function GraduationCap({ width, height, color }: IconProps) {
    return (
        <Svg
            width={width || 48}
            height={height || 48}
            viewBox="0 0 48 48"
            fill="none"
        >
            <Path
                d="M24 6L2 18L10 22.36V34.36L24 42L38 34.36V22.36L42 20.18V34H46V18L24 6ZM37.64 18L24 25.44L10.36 18L24 10.56L37.64 18ZM34 32L24 37.44L14 32V24.54L24 30L34 24.54V32Z"
                fill={color}
            />
        </Svg>
    );
}
