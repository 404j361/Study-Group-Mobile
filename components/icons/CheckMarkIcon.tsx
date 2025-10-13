import React from "react";
import Svg, { Path } from "react-native-svg";

type IconProps = {
    width?: number;
    height?: number;
    color?: string;
};

export default function CheckMark({
    width = 81,
    height = 80,
    color,
}: IconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 48 48" fill="none">
            <Path
                d="M44 22.16V24C43.9975 28.3128 42.601 32.5094 40.0187 35.9637C37.4363 39.418 33.8066 41.945 29.6707 43.1678C25.5349 44.3906 21.1145 44.2438 17.0689 42.7492C13.0234 41.2545 9.56931 38.4922 7.22192 34.8741C4.87453 31.2561 3.75958 26.9761 4.04335 22.6726C4.32712 18.3691 5.99441 14.2727 8.79656 10.9941C11.5987 7.71564 15.3856 5.43077 19.5924 4.4803C23.7992 3.52982 28.2005 3.96468 32.14 5.72"
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M44 8L24 28.02L18 22.02"
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
