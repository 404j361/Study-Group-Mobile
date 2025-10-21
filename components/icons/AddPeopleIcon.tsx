import React from "react";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

type IconProps = {
    width?: number;
    height?: number;
    color?: string;
};

export default function AddPeopleIcon({
    width = 16,
    height = 16,
    color,
}: IconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
            <G clipPath="url(#clip0_195_10689)">
                <Path
                    d="M10.666 14V12.6667C10.666 11.9594 10.3851 11.2811 9.88497 10.781C9.38487 10.281 8.70659 10 7.99935 10H3.33268C2.62544 10 1.94716 10.281 1.44706 10.781C0.946967 11.2811 0.666016 11.9594 0.666016 12.6667V14"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M5.66667 7.33333C7.13943 7.33333 8.33333 6.13943 8.33333 4.66667C8.33333 3.19391 7.13943 2 5.66667 2C4.19391 2 3 3.19391 3 4.66667C3 6.13943 4.19391 7.33333 5.66667 7.33333Z"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M13.334 5.3335V9.3335"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M15.334 7.3335H11.334"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </G>
            <Defs>
                <ClipPath id="clip0_195_10689">
                    <Rect width="16" height="16" fill="white" />
                </ClipPath>
            </Defs>
        </Svg>
    );
}
